import React, { useEffect } from 'react';
import './App.css';
import { Layout } from 'antd'
import { SiderComponent } from './components/SiderComponent'
import { Switch, Route } from 'react-router-dom'
import { RoutePath } from './utils/RouterPath';
import { Page } from './types/Page';
function App() {
  useEffect(() => {
    document.title = 'เงินเดือน'
  }, []);
  return (
    <Layout hasSider>
      <SiderComponent />
      <Layout className='right-content'>
        <Switch>
          {RoutePath.map((page: Page) => {
            return <Route key={page.path} path={page.path} component={page.component} exact></Route>
          })}
        </Switch>
      </Layout>
    </Layout>
  );
}

export default App;
