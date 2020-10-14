class SetCache {
    set cache(value) {
        this.roomHash = value.roomHash;
        this.questions = value.questions;
        this.traits = value.traits;
    }

    get cache() {
        return this.checkForUpdate().then(() => {
            return {
                roomHash: this.roomHash,
                questions: this.questions,
                traits: this.traits
            };
        });
    }

    async checkForUpdate() {
        if (Context.GetGameMeta().roomHash != this.roomHash) {
            await this.update();
        }
    }

    async update() {
        this.cache = await Context.GetSetData();
    }
}
