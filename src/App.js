import React from 'react';
import './App.css';
import {
  BrowserRouter as Router,
  Redirect,
  Switch,
  Route,
} from 'react-router-dom';
import Header from './components/Header';
import CredentialsForm from './components/CredentialsForm';
import PresentationsForm from './components/PresentationsForm';

function App() {
  return (
    <div className="App">
      <Router>
        <Header></Header>
        <div className="container-fluid">
          <Switch>
            <Route exact path="/">
              <Redirect to="/credentials" />
            </Route>
            <Route path="/credentials">
              <CredentialsForm />
            </Route>
            <Route path="/presentations">
              <PresentationsForm />
            </Route>
          </Switch>
        </div>
      </Router>
    </div>
  );
}

export default App;
