pub use crate::winget_parser::{AvailableUpdate, Package};
use crate::winget_parser::{
    parse_available_updates_output, parse_list_output, parse_search_output,
};
use serde::Serialize;
use std::{
    collections::VecDeque,
    env,
    ffi::OsString,
    fmt,
    io::{self, BufReader, Read},
    path::PathBuf,
    process::{Command, Stdio},
    thread,
};
use tauri::{AppHandle, Emitter, State};

#[derive(Debug)]
pub enum WingetError {
    NotFound,
    Io(io::Error),
    Failed {
        command: String,
        code: Option<i32>,
        stderr: String,
    },
    Progress(String),
    ReaderThread,
}

impl fmt::Display for WingetError {
    fn fmt(&self, formatter: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::NotFound => write!(
                formatter,
                "WinGet was not found on PATH or in the Windows App Execution Aliases directory"
            ),
            Self::Io(error) => write!(formatter, "Failed to run WinGet: {error}"),
            Self::Failed {
                command,
                code,
                stderr,
            } => {
                write!(
                    formatter,
                    "WinGet command `{command}` failed with exit code {code:?}"
                )?;
                if !stderr.trim().is_empty() {
                    write!(formatter, ": {}", stderr.trim())?;
                }
                Ok(())
            }
            Self::Progress(error) => write!(formatter, "Failed to report WinGet progress: {error}"),
            Self::ReaderThread => write!(formatter, "A WinGet output reader thread panicked"),
        }
    }
}

impl std::error::Error for WingetError {
    fn source(&self) -> Option<&(dyn std::error::Error + 'static)> {
        match self {
            Self::Io(error) => Some(error),
            _ => None,
        }
    }
}

impl From<io::Error> for WingetError {
    fn from(error: io::Error) -> Self {
        Self::Io(error)
    }
}

#[derive(Debug, Clone, Serialize)]
pub struct WingetProgressEvent {
    pub operation: String,
    pub stream: String,
    pub line: String,
}

impl WingetService {
    pub fn new() -> Self {
        Self
    }

    pub fn search(&self, query: &str) -> Result<Vec<Package>, WingetError> {
        let output = self.run_capture(&["search", query])?;
        Ok(parse_search_output(&output))
    }

    pub fn list_installed(&self) -> Result<Vec<Package>, WingetError> {
        let output = self.run_capture(&["list"])?;
        Ok(parse_list_output(&output))
    }

    pub fn list_available_updates(&self) -> Result<Vec<AvailableUpdate>, WingetError> {
        let output = self.run_capture(&["upgrade", "--accept-source-agreements"])?;
        Ok(parse_available_updates_output(&output))
    }

    pub fn install(
        &self,
        id: &str,
        progress: impl Fn(WingetProgressEvent) -> Result<(), String> + Send + Sync + 'static,
    ) -> Result<(), WingetError> {
        self.run_streaming(
            "install",
            &[
                "install",
                "--id",
                id,
                "--exact",
                "--accept-source-agreements",
                "--accept-package-agreements",
            ],
            progress,
        )
    }

    pub fn uninstall(
        &self,
        id: &str,
        progress: impl Fn(WingetProgressEvent) -> Result<(), String> + Send + Sync + 'static,
    ) -> Result<(), WingetError> {
        self.run_streaming("uninstall", &["uninstall", "--id", id, "--exact"], progress)
    }

    pub fn upgrade(
        &self,
        id: &str,
        progress: impl Fn(WingetProgressEvent) -> Result<(), String> + Send + Sync + 'static,
    ) -> Result<(), WingetError> {
        self.run_streaming(
            "upgrade",
            &[
                "upgrade",
                "--id",
                id,
                "--exact",
                "--accept-source-agreements",
                "--accept-package-agreements",
            ],
            progress,
        )
    }

    fn run_capture(&self, args: &[&str]) -> Result<String, WingetError> {
        let executable = resolve_winget()?;
        let output = Command::new(executable)
            .args(args)
            .arg("--disable-interactivity")
            .output()?;
        if !output.status.success() {
            return Err(WingetError::Failed {
                command: args.join(" "),
                code: output.status.code(),
                stderr: String::from_utf8_lossy(&output.stderr).into_owned(),
            });
        }
        Ok(String::from_utf8_lossy(&output.stdout).into_owned())
    }

    fn run_streaming(
        &self,
        operation: &str,
        args: &[&str],
        progress: impl Fn(WingetProgressEvent) -> Result<(), String> + Send + Sync + 'static,
    ) -> Result<(), WingetError> {
        let executable = resolve_winget()?;
        let mut child = Command::new(executable)
            .args(args)
            .stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .spawn()?;
        let stdout = child
            .stdout
            .take()
            .ok_or_else(|| WingetError::Io(io::Error::other("WinGet stdout was not captured")))?;
        let stderr = child
            .stderr
            .take()
            .ok_or_else(|| WingetError::Io(io::Error::other("WinGet stderr was not captured")))?;
        let progress: ProgressSink = std::sync::Arc::new(progress);
        let stdout_reader = spawn_reader(stdout, operation, "stdout", progress.clone());
        let stderr_reader = spawn_reader(stderr, operation, "stderr", progress);

        let status = child.wait()?;
        let stdout_lines = stdout_reader
            .join()
            .map_err(|_| WingetError::ReaderThread)?;
        let stderr_lines = stderr_reader
            .join()
            .map_err(|_| WingetError::ReaderThread)?;

        if let Some(error) = stdout_lines.read_error.or(stderr_lines.read_error) {
            return Err(WingetError::Io(error));
        }
        if !status.success() {
            return Err(WingetError::Failed {
                command: args.join(" "),
                code: status.code(),
                stderr: stderr_lines
                    .lines
                    .iter()
                    .cloned()
                    .collect::<Vec<_>>()
                    .join("\n"),
            });
        }
        if let Some(error) = stdout_lines.progress_error.or(stderr_lines.progress_error) {
            return Err(WingetError::Progress(error));
        }
        Ok(())
    }
}

impl Default for WingetService {
    fn default() -> Self {
        Self::new()
    }
}

#[derive(Clone, Copy)]
pub struct WingetService;

type ProgressSink =
    std::sync::Arc<dyn Fn(WingetProgressEvent) -> Result<(), String> + Send + Sync + 'static>;

fn spawn_reader<R>(
    reader: R,
    operation: &str,
    stream: &'static str,
    progress: ProgressSink,
) -> thread::JoinHandle<ReaderOutput>
where
    R: io::Read + Send + 'static,
{
    let operation = operation.to_owned();
    thread::spawn(move || {
        let mut output = ReaderOutput::default();
        let mut reader = BufReader::new(reader);
        let mut buffer = [0; 4096];
        let mut pending = Vec::new();

        loop {
            match reader.read(&mut buffer) {
                Ok(0) => break,
                Ok(count) => {
                    for byte in &buffer[..count] {
                        if matches!(*byte, b'\n' | b'\r') {
                            if !pending.is_empty() {
                                emit_stream_line(
                                    &mut output,
                                    &pending,
                                    &operation,
                                    stream,
                                    &progress,
                                );
                                pending.clear();
                            }
                        } else {
                            pending.push(*byte);
                        }
                    }
                }
                Err(error) => {
                    if error.kind() == io::ErrorKind::Interrupted {
                        continue;
                    }
                    output.read_error = Some(error);
                    break;
                }
            }
        }
        if !pending.is_empty() {
            emit_stream_line(&mut output, &pending, &operation, stream, &progress);
        }
        output
    })
}

fn emit_stream_line(
    output: &mut ReaderOutput,
    bytes: &[u8],
    operation: &str,
    stream: &str,
    progress: &ProgressSink,
) {
    let line = String::from_utf8_lossy(bytes).into_owned();
    if let Err(error) = progress(WingetProgressEvent {
        operation: operation.to_owned(),
        stream: stream.to_owned(),
        line: line.clone(),
    }) {
        output.progress_error.get_or_insert(error);
    }
    if stream == "stderr" {
        if output.lines.len() == 64 {
            output.lines.pop_front();
        }
        output.lines.push_back(line);
    }
}

#[derive(Default)]
struct ReaderOutput {
    lines: VecDeque<String>,
    progress_error: Option<String>,
    read_error: Option<io::Error>,
}

fn resolve_winget() -> Result<PathBuf, WingetError> {
    let mut directories = env::var_os("PATH")
        .map(|paths| env::split_paths(&paths).collect::<Vec<_>>())
        .unwrap_or_default();

    if let Some(local_app_data) = env::var_os("LOCALAPPDATA") {
        directories.push(
            PathBuf::from(local_app_data)
                .join("Microsoft")
                .join("WindowsApps"),
        );
    }

    let names = executable_names();
    for directory in directories {
        for name in &names {
            let candidate = directory.join(name);
            if candidate.is_file() {
                return Ok(candidate);
            }
        }
    }
    Err(WingetError::NotFound)
}

fn executable_names() -> Vec<OsString> {
    #[cfg(windows)]
    {
        vec![OsString::from("winget.exe"), OsString::from("winget")]
    }
    #[cfg(not(windows))]
    {
        vec![OsString::from("winget"), OsString::from("winget.exe")]
    }
}

#[tauri::command]
pub async fn winget_search(
    query: String,
    service: State<'_, WingetService>,
) -> Result<Vec<Package>, String> {
    let service = service.inner().clone();
    tauri::async_runtime::spawn_blocking(move || service.search(&query))
        .await
        .map_err(|error| error.to_string())?
        .map_err(|error| error.to_string())
}

#[tauri::command]
pub async fn winget_list_installed(
    service: State<'_, WingetService>,
) -> Result<Vec<Package>, String> {
    let service = service.inner().clone();
    tauri::async_runtime::spawn_blocking(move || service.list_installed())
        .await
        .map_err(|error| error.to_string())?
        .map_err(|error| error.to_string())
}

#[tauri::command]
pub async fn winget_list_available_updates(
    service: State<'_, WingetService>,
) -> Result<Vec<AvailableUpdate>, String> {
    let service = service.inner().clone();
    tauri::async_runtime::spawn_blocking(move || service.list_available_updates())
        .await
        .map_err(|error| error.to_string())?
        .map_err(|error| error.to_string())
}

#[tauri::command]
pub async fn winget_install(
    id: String,
    app: AppHandle,
    service: State<'_, WingetService>,
) -> Result<(), String> {
    run_tauri_operation(service.inner().clone(), app, id, "install").await
}

#[tauri::command]
pub async fn winget_uninstall(
    id: String,
    app: AppHandle,
    service: State<'_, WingetService>,
) -> Result<(), String> {
    run_tauri_operation(service.inner().clone(), app, id, "uninstall").await
}

#[tauri::command]
pub async fn winget_upgrade(
    id: String,
    app: AppHandle,
    service: State<'_, WingetService>,
) -> Result<(), String> {
    run_tauri_operation(service.inner().clone(), app, id, "upgrade").await
}

async fn run_tauri_operation(
    service: WingetService,
    app: AppHandle,
    id: String,
    operation: &'static str,
) -> Result<(), String> {
    tauri::async_runtime::spawn_blocking(move || {
        let progress = move |event: WingetProgressEvent| {
            app.emit("winget-progress", event)
                .map_err(|error| error.to_string())
        };
        match operation {
            "install" => service.install(&id, progress),
            "uninstall" => service.uninstall(&id, progress),
            "upgrade" => service.upgrade(&id, progress),
            _ => unreachable!("the operation is selected by a Tauri command"),
        }
    })
    .await
    .map_err(|error| error.to_string())?
    .map_err(|error| error.to_string())
}
