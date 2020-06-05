export namespace Helpers {

  export function matrixToViewModel(sheet: GoogleAppsScript.Spreadsheet.Sheet) {
    return {
      teamName: sheet.getName(),
      members: sheet.getDataRange().getValues().map((row: string[]) => ({
        firstName: row[0],
        lastName: row[1],
        role: row[7],
        email: row[2]
      }))
    }
  }

}
