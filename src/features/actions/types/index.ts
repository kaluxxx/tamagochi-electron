export type ActionType = 'feed' | 'play' | 'sleep' | 'heal'
export type ActiveAction = 'sleeping' | 'playing' | undefined
export type ActiveActionType = 'sleeping' | 'playing'

export interface ActiveActionState {
  type: ActiveActionType
  startTime: number
  duration: number
}