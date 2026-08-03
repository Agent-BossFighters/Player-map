// Player-map/src/PlayerMap.tsx
import React, { useEffect, useRef } from 'react'
import { GameContextProvider } from './contexts/GameContext'
import GraphComponent from './GraphComponent'
import type { PlayerMapProps } from './types/PlayerMapConfig'
import { postSession } from './api/sessionApi'

const PlayerMap: React.FC<PlayerMapProps> = ({
  games,
  activeGameId,
  onGameChange,
  initialProfile,
  getAccessToken,
}) => {
  const hasFiredSession = useRef(false)

  useEffect(() => {
    if (!getAccessToken || hasFiredSession.current) return
    hasFiredSession.current = true
    postSession(getAccessToken)
  }, [getAccessToken])

  return (
    <GameContextProvider games={games} activeGameId={activeGameId} onGameChange={onGameChange}>
      <GraphComponent initialProfile={initialProfile} />
    </GameContextProvider>
  )
}

export default PlayerMap
