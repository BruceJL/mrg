import PostgrestAdapter from './postgrestAdapter';

import config from '../config/environment';

export default class ApplicationAdapter extends PostgrestAdapter{
    //namespace = "api";
    //@ts-ignore
    //namespace = config.APP['API_NAMESPACE'];
}