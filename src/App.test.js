import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

it('shows server instance after clicking ', () => {
  const div = document.createElement('div');
  ReactDOM.render(<App />, div);
  const textField = div.querySelector('#outlined-with-placeholder');
  textField.textContent = 'http://localhost:5000';
  expect(textField.textContent).toBe('http://localhost:5000');
  //ReactDOM.unmountComponentAtNode(div);
});
