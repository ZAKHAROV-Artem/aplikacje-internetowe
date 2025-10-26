import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import customParseFormat from "dayjs/plugin/customParseFormat";
import duration from "dayjs/plugin/duration";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import localizedFormat from "dayjs/plugin/localizedFormat";
import minMax from "dayjs/plugin/minMax";
import relativeTime from "dayjs/plugin/relativeTime";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

// Extend dayjs with plugins
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(relativeTime);
dayjs.extend(duration);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
dayjs.extend(customParseFormat);
dayjs.extend(advancedFormat);
dayjs.extend(localizedFormat);
dayjs.extend(minMax);

export default dayjs;
