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
    // Lock only once a token actually resolved — getAccessToken() can
    // transiently return null while host auth is still initializing on
    // mount; locking unconditionally here would permanently skip the
    // daily-login session record for that load.
    postSession(getAccessToken).then((result) => {
      if (result.ok) hasFiredSession.current = true
    })
  }, [getAccessToken])

  return (
    <GameContextProvider games={games} activeGameId={activeGameId} onGameChange={onGameChange}>
      <GraphComponent initialProfile={initialProfile} />
    </GameContextProvider>
  )
}

export default PlayerMap
