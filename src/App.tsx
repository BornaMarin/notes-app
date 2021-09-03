import React from 'react';

// Styles
import './App.css';
import './shared/styles/ui.css'
import './shared/styles/typography.css'

// Components
import NotesView from "./modules/notes/views/NotesView";

// Main
function App() {
  return (
    <div className="App">
      <NotesView/>
    </div>
  );
}

export default App;
