import {
    ArrowDownIcon,
    ArrowUpIcon,
    BoxIconLine,
} from "../../icons";
import Badge from "../ui/badge/Badge";

export default function EcommerceMetrics() {

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
            {/* <!-- Metric Item Start --> */}
            <div
                className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
                <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
                    <i className='bx bx-notepad text-gray-200 text-3xl hover:text-red-400 transition duration-200'></i>
                    {/*<FileIcon className="text-gray-800 size-6 dark:text-white/90"/>*/}
                </div>

                <div className="flex items-end justify-between mt-5">
                    <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">

            </span>
                        <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                            cantidad
                        </h4>
                    </div>
                    <Badge color="success">
                        <ArrowUpIcon/>
                        promedio
                    </Badge>
                    <Badge color="error">
                        <ArrowDownIcon/>
                        promedio
                    </Badge>
                </div>
            </div>
            {/* <!-- Metric Item End --> */}

            {/* <!-- Metric Item Start --> */}
            <div
                className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
                <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
                    <BoxIconLine className="text-gray-800 size-6 dark:text-white/90"/>
                </div>
                <div className="flex items-end justify-between mt-5">
                    <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Orders
            </span>
                        <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                            5,359
                        </h4>
                    </div>

                    <Badge color="error">
                        <ArrowDownIcon/>
                        9.05%
                    </Badge>
                </div>
            </div>
            {/* <!-- Metric Item End --> */}
        </div>
    );
}
