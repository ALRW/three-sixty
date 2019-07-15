namespace Results {

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
    .getRange(1, 1, sheet.getLastRow(), sheet.getLastColumn())
    .getValues()

  //TODO finish implementation
  export function createPayload(personalSpreadsheetId, teamSpreadSheetId){
    return 1
  }

}

