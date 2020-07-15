import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import './style.scss';

const App = () => <div className="test">All the REACT are belong to us!</div>;

ReactDOM.render(<App />, document.getElementById('main'));

let time = 0;
setInterval(() => {
  $('#main').html(`You have been on this page for ${time} second(s).`);
  time += 1;
}, 1000);
