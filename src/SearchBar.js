import React from 'react';

var SearchBar = (props) => {
  return (
   <div className='container row'>
        <div className='search col-xs-12 col-sm-6 col-md-4'>
          <form className='search-form' role='search' onSubmit={runSubmit}>
            <div className='input-group'>
              <input type='text'
                id='searchValue'
                className='form-control no-shadow' placeholder='Enter A, T, C, G sequence here'
                onChange={runSearch}/>
                <span className='input-group-btn'>
                  <button className='btn' tabIndex='-1' type='submit'>
                    <span className='glyphicon glyphicon-search'></span>
                  </button>
                </span>
            </div>
          </form>
        </div>
      </div>
 );
};

function runSubmit(e) {
  var query = e.target.querySelector('#searchValue').value;
  console.log(query);
  e.preventDefault();
}
function runSearch(e) {
  console.log(e.target.value);
}

export default SearchBar;
