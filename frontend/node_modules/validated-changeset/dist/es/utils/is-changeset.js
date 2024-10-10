export const CHANGESET = '__CHANGESET__';
export default function isChangeset(changeset) {
    return changeset && changeset['__changeset__'] === CHANGESET;
}
//# sourceMappingURL=is-changeset.js.map