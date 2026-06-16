import React, { useEffect } from 'react';
import { useDidShow, useDidHide } from '@tarojs/taro';
import './app.scss';
import { AppStoreProvider } from '@/store/AppContext';

function App(props) {
  useEffect(() => {});
  useDidShow(() => {});
  useDidHide(() => {});

  return (
    <AppStoreProvider>
      {props.children}
    </AppStoreProvider>
  );
}

export default App;
