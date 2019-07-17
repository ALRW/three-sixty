namespace Results {

  //TODO move to common namespace
  const DEFAULT_SHEET = 'Sheet1'
  const DEFAULT_RESULTS_SHEET = 'Form Responses 1'

  const VALUES: string[] = [
    'Execution',
    'Consistency',
    'Quality',
    'Design & Architecture',
    'Problem Solving',
    'Curiosity',
    'Accountability',
    'Communication',
    'Delivery',
    'Grit',
    'People Orientation',
    'Emotional Intelligence',
    'Craft',
    'Purpose',
  ]

  const VALUE_MAPPING: { [s: string]: number }  = {
    "are smashing it": 3,
    "are spot on": 2,
    "have room to do more": 1
  }

  const sheetData = (sheet): string[][] =>
  sheet
    .getRange(2, 1, sheet.getLastRow(), sheet.getLastColumn())
    .getValues()

  //TODO finish implementation
  export function createPayload(personalSpreadsheetId, teamSpreadsheetId) {
    const personalSpreadsheet = SpreadsheetApp.openById(personalSpreadsheetId)
    const teamSpreadsheet = SpreadsheetApp.openById(teamSpreadsheetId)
    const isNotDefaultSheet = sheet => sheet.getName() !== DEFAULT_SHEET
    const personalSheets = personalSpreadsheet.getSheets().filter(isNotDefaultSheet)
    const teamSheets = teamSpreadsheet.getSheets().filter(isNotDefaultSheet)
    const getRowsPerRound = sheet => sheet.getLastRow() - 1
    const rowsPerRoundPersonal = personalSheets.map(getRowsPerRound).reverse()
    const rowsPerRoundTeam = teamSheets.map(getRowsPerRound).reverse()
    const personalData = sheetData(personalSpreadsheet.getSheetByName(DEFAULT_RESULTS_SHEET))
    const teamData = sheetData(teamSpreadsheet.getSheetByName(DEFAULT_RESULTS_SHEET))
    const groupRounds = data => (result, n, i, original) => {
      if(i === original.length -1) {
        return result
      }
      return [...result, data.slice(n, original[i + 1])]
    }
    const groupedPersonalData = [0, ...rowsPerRoundPersonal].reduce(groupRounds(personalData), [])
    const groupedTeamData = [0, ...rowsPerRoundTeam].reduce(groupRounds(teamData), [])
  }

}

