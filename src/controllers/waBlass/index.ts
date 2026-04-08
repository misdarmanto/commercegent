import { waBlasHistoryFindAll, waBlasHistoryFindOne } from './history'
import { removeWablasHistory } from './remove'
import { waBlasSendMessage } from './sendMessage'

export const WaBlasController = {
  waBlasHistoryFindAll,
  waBlasHistoryFindOne,
  removeWablasHistory,
  waBlasSendMessage
}
