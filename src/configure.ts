import { apiUrl } from "@/env-config";
import { Config, ConflictStrategy } from "@/types";

class Configure {
	private static _apiUrl = apiUrl;

	private static _conflictStrategy = ConflictStrategy.PASSTHROUGH;

	public static getApiUrl() {
		return this._apiUrl;
	}

	public static getConflictStrategy() {
		return this._conflictStrategy;
	}

	public static use(config: Config) {
		// What api url will usher use?
		// 1. If apiUrl is set by the user, use that
		// 2. Otherwise, use the default apiUrl
		if (typeof config.apiUrl === "string") {
			this._apiUrl = config.apiUrl;
		}
		if (typeof config.conflictStrategy === "string") {
			const strats = Object.values(ConflictStrategy);
			if (!strats.includes(config.conflictStrategy)) {
				throw new Error(
					`Conflict Strategy must be one of type: ${strats.join(", ")}`
				);
			}
			this._conflictStrategy = config.conflictStrategy;
		}
	}
}

export default Configure;
