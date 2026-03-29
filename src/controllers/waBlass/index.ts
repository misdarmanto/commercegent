import { waBlasHistoryFindAll, waBlasHistoryFindOne } from './history'
import { removeWablasHistory } from './remove'
import { waBlasSendMessage } from './sendMessage'

export const WaBlasController = {
  findAllHistory: waBlasHistoryFindAll,
  findDetailHistory: waBlasHistoryFindOne,
  removeWablasHistory,
  send: waBlasSendMessage
}
