import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import Module from './app/Module';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <StrictMode>
    <Module />
  </StrictMode>
);
