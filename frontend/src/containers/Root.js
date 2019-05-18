import React from 'react';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
import { withRouter } from "react-router";
import Routes from '../routes';

class ScrollToTop extends React.Component {
  constructor(props) {
    super(props);
  }
  componentDidMount() {
    this.props.history && this.props.history.listen((location, action) => {
      window.scrollTo(0,0);
  });
  }
  

  render() {
    return this.props.children;
  }
}

const ScrollWithRouter = withRouter(ScrollToTop);

export default ({ store, history }) => (
  <Provider store={store}>
    <ConnectedRouter history={history}>
    <ScrollWithRouter>
      <Routes />
    </ScrollWithRouter>
    </ConnectedRouter>
  </Provider>
  );
