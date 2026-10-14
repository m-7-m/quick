pub mod winget;
pub mod winget_parser;

#[cfg(not(any(target_os = "android", target_os = "ios")))]
use tauri::{
    AppHandle, Manager, WindowEvent,
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
};

#[cfg(not(any(target_os = "android", target_os = "ios")))]
fn show_main_window(app: &AppHandle) {
    match app.get_webview_window("main") {
        Some(window) => {
            if let Err(error) = window.show() {
                log::error!("Failed to show the main window: {error}");
            }
            if let Err(error) = window.set_focus() {
                log::error!("Failed to focus the main window: {error}");
            }
        }
        None => log::error!("Could not find the main window."),
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let builder = tauri::Builder::default().plugin(tauri_plugin_notification::init());

    #[cfg(not(any(target_os = "android", target_os = "ios")))]
    let builder = builder.plugin(tauri_plugin_autostart::Builder::new().build());

    builder
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
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
            #[cfg(not(any(target_os = "android", target_os = "ios")))]
            {
                let open_item = MenuItem::with_id(app, "open", "Open Quick", true, None::<&str>)?;
                let quit_item = MenuItem::with_id(app, "quit", "Quit Quick", true, None::<&str>)?;
                let menu = Menu::with_items(app, &[&open_item, &quit_item])?;
                let icon = app
                    .default_window_icon()
                    .cloned()
                    .ok_or_else(|| std::io::Error::other("The default app icon is missing."))?;

                TrayIconBuilder::new()
                    .icon(icon)
                    .menu(&menu)
                    .tooltip("Quick")
                    .show_menu_on_left_click(false)
                    .on_menu_event(|app, event| match event.id().as_ref() {
                        "open" => show_main_window(app),
                        "quit" => app.exit(0),
                        _ => {}
                    })
                    .on_tray_icon_event(|tray, event| {
                        if let TrayIconEvent::Click {
                            button: MouseButton::Left,
                            button_state: MouseButtonState::Up,
                            ..
                        } = event
                        {
                            show_main_window(tray.app_handle());
                        }
                    })
                    .build(app)?;

                let window = app
                    .get_webview_window("main")
                    .ok_or_else(|| std::io::Error::other("The main window is missing."))?;
                let close_window = window.clone();
                window.on_window_event(move |event| {
                    if let WindowEvent::CloseRequested { api, .. } = event {
                        api.prevent_close();
                        if let Err(error) = close_window.hide() {
                            log::error!("Failed to hide the main window: {error}");
                        }
                    }
                });
            }

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
