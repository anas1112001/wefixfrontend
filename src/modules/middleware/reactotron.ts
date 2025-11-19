import Reactotron from 'reactotron-react-js';
import { reactotronRedux } from 'reactotron-redux';

export const setupReactotron = () => {
  let reactotron = null;
  const ENV_NAME = 'development'

  /* istanbul ignore next */

  if (ENV_NAME === 'development' || ENV_NAME === 'staging') {
    reactotron = Reactotron.configure({ name: 'Hex' })
      .use(reactotronRedux())
      .connect();
      
  }

  return reactotron;
};
