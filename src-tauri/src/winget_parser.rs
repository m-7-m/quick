use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct Package {
    pub name: String,
    pub id: String,
    pub version: String,
    pub source: Option<String>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct AvailableUpdate {
    pub name: String,
    pub id: String,
    pub current_version: String,
    pub available_version: String,
    pub source: Option<String>,
}

#[derive(Debug, Clone, Copy)]
enum TableKind {
    Search,
    List,
    Upgrade,
}

#[derive(Debug, Clone)]
struct Columns {
    name: usize,
    id: usize,
    version: usize,
    available: Option<usize>,
    source: Option<usize>,
    boundaries: Vec<usize>,
}

pub fn parse_search_output(output: &str) -> Vec<Package> {
    parse_packages(output, TableKind::Search)
}

pub fn parse_list_output(output: &str) -> Vec<Package> {
    parse_packages(output, TableKind::List)
}

pub fn parse_available_updates_output(output: &str) -> Vec<AvailableUpdate> {
    let lines = output.lines().collect::<Vec<_>>();
    let Some((columns, separator_index)) = find_table(&lines, TableKind::Upgrade) else {
        return Vec::new();
    };
    let Some(available_column) = columns.available else {
        return Vec::new();
    };

    lines[separator_index + 1..]
        .iter()
        .filter_map(|line| parse_update_row(line, &columns, available_column))
        .collect()
}

fn parse_packages(output: &str, kind: TableKind) -> Vec<Package> {
    let lines = output.lines().collect::<Vec<_>>();
    let Some((columns, separator_index)) = find_table(&lines, kind) else {
        return Vec::new();
    };

    lines[separator_index + 1..]
        .iter()
        .filter_map(|line| parse_row(line, &columns))
        .collect()
}

fn find_table(lines: &[&str], kind: TableKind) -> Option<(Columns, usize)> {
    for separator_index in 1..lines.len() {
        if !is_separator(lines[separator_index]) {
            continue;
        }
        let header = lines[..separator_index]
            .iter()
            .rev()
            .take_while(|line| !line.trim().is_empty())
            .find_map(|line| identify_columns(line, kind));
        if let Some(columns) = header {
            return Some((columns, separator_index));
        }
    }
    None
}

fn is_separator(line: &str) -> bool {
    let trimmed = line.trim();
    trimmed
        .chars()
        .filter(|character| *character == '-')
        .count()
        >= 3
        && trimmed
            .chars()
            .all(|character| character == '-' || character.is_whitespace())
}

fn identify_columns(header: &str, _kind: TableKind) -> Option<Columns> {
    let mut byte_offset = 0;
    let labels = header
        .split_whitespace()
        .map(|label| {
            let offset = byte_offset + header[byte_offset..].find(label).unwrap_or(0);
            byte_offset = offset + label.len();
            (label, header[..offset].chars().count())
        })
        .collect::<Vec<_>>();
    let locate = |names: &[&str]| {
        labels
            .iter()
            .find(|(label, _)| names.iter().any(|name| label.eq_ignore_ascii_case(name)))
            .map(|(_, position)| *position)
    };
    let first_three = || (labels.len() >= 3).then(|| (labels[0].1, labels[1].1, labels[2].1));
    let (name, id, version) = match (
        locate(&["Name", "Package", "Nom", "Nombre", "Nome", "Имя", "名称"]),
        locate(&["Id", "ID", "Identifiant", "Kennung", "Идентификатор"]),
        locate(&["Version", "Versión", "Versione", "Версия", "バージョン"]),
    ) {
        (Some(name), Some(id), Some(version)) => (name, id, version),
        _ => first_three()?,
    };
    let source = locate(&[
        "Source",
        "Quelle",
        "Fuente",
        "Origine",
        "Источник",
        "ソース",
    ]);
    let available = locate(&[
        "Available",
        "Disponible",
        "Verfügbar",
        "Disponível",
        "Disponibile",
        "Доступно",
        "利用可能",
    ]);
    let mut boundaries = labels
        .iter()
        .map(|(_, position)| *position)
        .collect::<Vec<_>>();
    boundaries.sort_unstable();
    boundaries.dedup();

    Some(Columns {
        name,
        id,
        version,
        available,
        source,
        boundaries,
    })
}

fn parse_row(line: &str, columns: &Columns) -> Option<Package> {
    if line.trim().is_empty() || is_separator(line) {
        return None;
    }
    let cell = |start: usize, next: Option<usize>| {
        let value = slice_chars(line, start, next.unwrap_or(usize::MAX)).trim();
        (!value.is_empty()).then(|| value.to_owned())
    };
    let name = cell(columns.name, next_column(&columns.boundaries, columns.name))?;
    let id = cell(columns.id, next_column(&columns.boundaries, columns.id))?;
    let version = cell(
        columns.version,
        next_column(&columns.boundaries, columns.version),
    )?;
    if !looks_like_package_id(&id) || !looks_like_version(&version) {
        return None;
    }
    let source = columns
        .source
        .and_then(|start| cell(start, next_column(&columns.boundaries, start)));
    Some(Package {
        name,
        id,
        version,
        source,
    })
}

fn parse_update_row(
    line: &str,
    columns: &Columns,
    available_column: usize,
) -> Option<AvailableUpdate> {
    if line.trim().is_empty() || is_separator(line) {
        return None;
    }
    let cell = |start: usize, next: Option<usize>| {
        let value = slice_chars(line, start, next.unwrap_or(usize::MAX)).trim();
        (!value.is_empty()).then(|| value.to_owned())
    };
    let name = cell(columns.name, next_column(&columns.boundaries, columns.name))?;
    let id = cell(columns.id, next_column(&columns.boundaries, columns.id))?;
    let current_version = cell(
        columns.version,
        next_column(&columns.boundaries, columns.version),
    )?;
    let available_version = cell(
        available_column,
        next_column(&columns.boundaries, available_column),
    )?;
    if !looks_like_package_id(&id)
        || !looks_like_version(&current_version)
        || !looks_like_version(&available_version)
    {
        return None;
    }
    let source = columns
        .source
        .and_then(|start| cell(start, next_column(&columns.boundaries, start)));
    Some(AvailableUpdate {
        name,
        id,
        current_version,
        available_version,
        source,
    })
}

fn next_column(columns: &[usize], current: usize) -> Option<usize> {
    columns
        .iter()
        .copied()
        .filter(|start| *start > current)
        .min()
}

fn slice_chars(value: &str, start: usize, end: usize) -> &str {
    let start_byte = value
        .char_indices()
        .nth(start)
        .map(|(index, _)| index)
        .unwrap_or(value.len());
    let end_byte = value
        .char_indices()
        .nth(end)
        .map(|(index, _)| index)
        .unwrap_or(value.len());
    &value[start_byte..end_byte.max(start_byte)]
}

fn looks_like_package_id(value: &str) -> bool {
    !value.is_empty()
        && value
            .chars()
            .any(|character| character.is_ascii_alphanumeric())
        && value
            .chars()
            .all(|character| !character.is_whitespace() && !character.is_control())
}

fn looks_like_version(value: &str) -> bool {
    !value.is_empty()
        && value
            .chars()
            .all(|character| !character.is_whitespace() && !character.is_control())
}

#[cfg(test)]
mod tests {
    use super::{
        AvailableUpdate, Package, parse_available_updates_output, parse_list_output,
        parse_search_output,
    };

    fn packages(output: &str) -> Vec<Package> {
        parse_search_output(output)
    }

    #[test]
    fn parses_normal_search_table() {
        let output = "Name          Id             Version\n--------------------------------------\n7-Zip         7zip.7zip      24.09\n";
        assert_eq!(
            packages(output),
            vec![Package {
                name: "7-Zip".into(),
                id: "7zip.7zip".into(),
                version: "24.09".into(),
                source: None,
            }]
        );
    }

    #[test]
    fn preserves_spaces_in_package_names_and_reads_source() {
        let output = format!(
            "{:<21}{:<27}{:<12}{}\n{}\n{:<21}{:<27}{:<12}{}\n",
            "Name",
            "Id",
            "Version",
            "Source",
            "-".repeat(60),
            "Microsoft Visual C++",
            "Microsoft.VCRedist.2015+",
            "14.42.34433",
            "winget"
        );
        assert_eq!(
            packages(&output),
            vec![Package {
                name: "Microsoft Visual C++".into(),
                id: "Microsoft.VCRedist.2015+".into(),
                version: "14.42.34433".into(),
                source: Some("winget".into()),
            }]
        );
    }

    #[test]
    fn parses_multiple_results_and_multicomponent_versions() {
        let output = "Name             Id                     Version   Match\n--------------------------------------------------------\nVisual Studio    Microsoft.VisualStudio 17.10.4.0 Exact\nGit              Git.Git                2.45.1    Exact\n";
        assert_eq!(packages(output).len(), 2);
        assert_eq!(packages(output)[0].name, "Visual Studio");
        assert_eq!(packages(output)[0].version, "17.10.4.0");
    }

    #[test]
    fn handles_empty_results_and_warnings_before_table() {
        assert!(packages("No package found matching input criteria.\n").is_empty());
        let output = "Warning: Agreements for source must be accepted.\n\nName       Id          Version\n---------------------------------\n";
        assert!(packages(output).is_empty());
    }

    #[test]
    fn skips_malformed_rows() {
        let output = "Name            Id              Version\n----------------------------------------\nValid Package   Valid.Package   1.2.3\nIncomplete row\n";
        let parsed = packages(output);
        assert_eq!(parsed.len(), 1);
        assert_eq!(parsed[0].id, "Valid.Package");
    }

    #[test]
    fn recognizes_common_localized_column_labels() {
        let output = format!(
            "{:<19}{:<16}{}\n{}\n{:<19}{:<16}{}\n",
            "Имя",
            "Id",
            "Версия",
            "-".repeat(37),
            "Текстовый редактор",
            "Example.Editor",
            "2.1.0"
        );
        assert_eq!(packages(&output).len(), 1);
        assert_eq!(packages(&output)[0].name, "Текстовый редактор");
    }

    #[test]
    fn parses_installed_table_with_available_column() {
        let output = "Name       Id          Version   Available   Source\n---------------------------------------------------\nGit        Git.Git     2.44.0    2.45.1      winget\n";
        let parsed = parse_list_output(output);
        assert_eq!(parsed.len(), 1);
        assert_eq!(parsed[0].source.as_deref(), Some("winget"));
    }

    #[test]
    fn parses_available_updates_table() {
        let output = "Name       Id          Version   Available   Source\n---------------------------------------------------\nGit        Git.Git     2.44.0    2.45.1      winget\n";
        assert_eq!(
            parse_available_updates_output(output),
            vec![AvailableUpdate {
                name: "Git".into(),
                id: "Git.Git".into(),
                current_version: "2.44.0".into(),
                available_version: "2.45.1".into(),
                source: Some("winget".into()),
            }]
        );
    }

    #[test]
    fn returns_no_updates_when_the_upgrade_table_is_missing() {
        assert!(parse_available_updates_output("No applicable upgrade found.\n").is_empty());
    }
}
