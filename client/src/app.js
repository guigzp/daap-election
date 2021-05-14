import React from 'react';
import { Switch, Route, BrowserRouter } from 'react-router-dom';
import Navigation from './nav';
import Results from './screens/results';
import Voters from './screens/voters';
import Home from './screens/home';

window.ethereum.on('accountsChanged', function (accounts) {
  window.location.reload();
});

export default class App extends React.Component {
  render() {
    return (
      <div style={{ background: '#F0E5E1' }}>
        <BrowserRouter>
          <div>
            <Navigation />
            <Switch>
              <Route exact path='/' component={Home} />
              <Route exact path='/results' component={Results} />
              <Route exact path='/voters' component={Voters} />
            </Switch>
          </div>
        </BrowserRouter>
      </div>
    );
  }
}
