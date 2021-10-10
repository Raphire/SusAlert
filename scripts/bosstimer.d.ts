import * as a1lib from "@alt1/base";
import { ImgRef } from "@alt1/base";
export default class BossTimerReader {
    pos: a1lib.RectLike | null;
    find(img?: ImgRef): a1lib.RectLike | null;
    read(img?: ImgRef): {
        minpart: number;
        secpart: number;
        time: number;
    } | null;
}
//# sourceMappingURL=index.d.ts.map