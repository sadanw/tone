import $ from 'jquery';
import './style.scss';

let time = 0;
setInterval(() => {
  $('#main').html(`You have been on this page for ${time} second(s).`);
  time += 1;
}, 1000);
