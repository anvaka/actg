import React from 'react';
import bus from './bus.js';

class SearchBar extends React.Component {

  render() {
    var result = this.state.result;
    var error = this.state.error;

    return (
   <div className='container row'>
      <div className='search col-xs-12 col-sm-6 col-md-4'>
        <form className='search-form' role='search' onSubmit={this.runSubmit.bind(this)}>
          <div className='input-group'>
            <input type='text'
              id='searchValue'
              className='form-control no-shadow' placeholder='Enter A, T, C, G sequence here'
              onChange={this.runSearch.bind(this)}/>
              <span className='input-group-btn'>
                <button className='btn' tabIndex='-1' type='submit'>
                  <span className='glyphicon glyphicon-search'></span>
                </button>
              </span>
          </div>
          {
            error ?
            (<div className="alert alert-danger" role="alert">
              <span className="glyphicon glyphicon-exclamation-sign" aria-hidden="true"></span>
              <span className="sr-only">Error:</span>
              {error}
            </div>) : null
          }
          {result}
        </form>
      </div>
    </div>
    );
  }

  runSearch(e) {
    var query = e.target.value;
    try {
      var node = this.props.model.getUsedCount(query);
      this.setState({
        result: formatUsed(node),
        error: null
      });
      bus.fire('highlight', node && node.sequence);
    } catch(e) {
      this.setState({
        error: e.message
      });
      bus.fire('highlight', null);
    }
  }

  runSubmit(e) {
    var query = e.target.querySelector('#searchValue').value;
    e.preventDefault();
  }
}

SearchBar.prototype.state = {
    query: '',
    result: '',
    error: null
};

function formatUsed(node) {
  if (!node) return null;
  var number = formatNumber(node.frequency);
  return <div className='results'><b>{node.sequence}</b> occurs <b>{number}</b> times</div>;
}

function formatNumber(n) {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
export default SearchBar;
