import React, { useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import { Layout, Menu } from 'antd'
import { SiderComponent } from './components/SiderComponent'
import { Switch, Route } from 'react-router-dom'
import { RoutePath } from './utils/RouterPath';
import { Page } from './types/Page';
import { HeaderComponent } from './components/HeaderComponent';
import { Footer } from 'antd/lib/layout/layout';
function App() {
  useEffect(() => {
    document.title = 'เงินเดือน'
  }, []);
  return (
    <>
      <Layout>
        <Layout>
          <SiderComponent />
          <Layout className='right-content'>
            <Switch>
              {RoutePath.map((page: Page) => {
                return <Route path={page.path} component={page.component} exact></Route>
              })}
            </Switch>
          </Layout>
        </Layout>
      </Layout>
    </>
  );
}

export default App;
