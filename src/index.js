require('es6-promise').polyfill();

import React from 'react';
import { render } from 'react-dom';
import { App } from './App';

import fetch from 'isomorphic-fetch';
import {endpoint} from '../config.js';
import createModel from './lib/model.js';
import createStage from './lib/createStage.js';

fetch(endpoint + 'out.count', {
  responseType: 'arraybuffer'
}).then(function(response) {
    if (response.status >= 400) {
        throw new Error("Bad response from server");
    }
    return response.arrayBuffer();
}).then(function (buffer) {
  var model = createModel(new Uint32Array(buffer));
  createStage(model);
});

render(<App />, document.getElementById('react-root'));
