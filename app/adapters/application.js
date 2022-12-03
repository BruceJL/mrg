import PostgrestAdapter from './postgrestAdapter';

export default class ApplicationAdapter extends PostgrestAdapter{
    namespace = "";
    host = "";

    shouldReloadAll(store, snapshotsArray) {
        return true;
    }

    shouldBackgroundReloadAll(store, snapshotsArray) {
        return true;
    }
}