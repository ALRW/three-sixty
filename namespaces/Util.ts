import { Constants } from './Constants'
export namespace Util {

  export function matrixToViewModel(sheet: GoogleAppsScript.Spreadsheet.Sheet): object {
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

  export function getPersonsIndex(
    sheet: GoogleAppsScript.Spreadsheet.Sheet,
    firstName: string,
    lastName: string
  ): number {
    return sheet.getDataRange()
    .getValues()
    .map(row => row.slice(0, 2).join('').toLowerCase())
    .indexOf(`${firstName}${lastName}`.toLowerCase()) + 1
  }

  export function multiplyArray(arr: any[], times: number): any[] {
    return times ? arr.concat(multiplyArray(arr, times - 1)) : []
  }

  export function isNotDefaultSheet(sheet: GoogleAppsScript.Spreadsheet.Sheet): boolean {
    return sheet.getName() !==  Constants.DEFAULT_SHEET
  }

  export function  errorPayload(errorMessage: string): object {
    return { error: errorMessage }
  }

}
