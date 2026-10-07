pub mod winget;
pub mod winget_parser;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .manage(winget::WingetService::new())
        .invoke_handler(tauri::generate_handler![
            winget::winget_search,
            winget::winget_list_installed,
            winget::winget_list_available_updates,
            winget::winget_install,
            winget::winget_uninstall,
            winget::winget_upgrade
        ])
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while building tauri application");
}
