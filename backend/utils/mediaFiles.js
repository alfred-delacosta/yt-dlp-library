import path from "node:path";
import { realpath, rm, stat } from "node:fs/promises";
import { rootFolder } from "./fileOperations.js";

const mediaRoot = path.resolve(rootFolder, "media");

export function resolveMediaFile(filePath) {
    if (typeof filePath !== "string" || filePath.trim() === "") return null;
    const candidate = path.isAbsolute(filePath) ? filePath : path.resolve(rootFolder, filePath);
    const resolved = path.resolve(candidate);
    const relative = path.relative(mediaRoot, resolved);
    if (
        relative === ""
        || relative === ".."
        || relative.startsWith(`..${path.sep}`)
        || path.isAbsolute(relative)
    ) {
        return null;
    }
    return resolved;
}

export async function removeMediaFiles(paths) {
    const unique = [...new Set(paths.map((filePath) => resolveMediaFile(filePath)).filter(Boolean))];
    for (const file of unique) {
        try {
            const info = await stat(file);
            if (!info.isFile()) continue;
            const real = await realpath(file);
            if (!resolveMediaFile(real)) continue;
            await rm(real);
        } catch (error) {
            if (error?.code !== "ENOENT") throw error;
        }
    }
}
