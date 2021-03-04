import React, { useEffect, useState } from 'react'
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom'

import Home from '@/components/pages/Home'
import Settings from '@/components/pages/Settings'

export default function App() {
  return (
    <Router>
      <Switch>
        <Route path="/" exact>
          <Home />
        </Route>
        <Route path="/settings" exact>
          <Settings />
        </Route>
      </Switch>
    </Router>
  )
}
