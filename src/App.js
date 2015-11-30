import React, { Component } from 'react';
import SearchBar from './SearchBar.js';

export class App extends Component {
  render() {
    return (
    <div>
      <SearchBar model={this.props.model} />
    </div>);
  }
}
