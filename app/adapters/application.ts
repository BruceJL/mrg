import PostgrestAdapter from './postgrestAdapter';
import ENV from '../config/environment';


export default class ApplicationAdapter extends PostgrestAdapter{
    namespace = 'api';
    //@ts-ignore
    //namespace = ENV.APP.API_NAMESPACE;
}