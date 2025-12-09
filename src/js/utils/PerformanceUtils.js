// Lightweight Performance utilities for chunked/batched work
const PerformanceUtils = (function(){
    // requestIdleCallback polyfill
    const ric = window.requestIdleCallback || function (cb) {
        return setTimeout(() => cb({timeRemaining: () => 50}), 1);
    };
    const cancelRic = window.cancelIdleCallback || clearTimeout;

    function processInChunks(items, renderFn, options = {}) {
        const chunkSize = options.chunkSize || 50;
        const delay = options.delay || 0; // ms between chunks if using setTimeout
        let index = 0;

        return new Promise((resolve) => {
            function work(deadline) {
                let count = 0;
                while (index < items.length && (count < chunkSize) && (deadline && deadline.timeRemaining ? deadline.timeRemaining() > 0 : true)) {
                    try {
                        renderFn(items[index], index);
                    } catch (e) {
                        console.error('Error in renderFn', e);
                    }
                    index++;
                    count++;
                }

                if (index < items.length) {
                    // schedule next chunk
                    ric(work);
                } else {
                    resolve();
                }
            }

            ric(work);
        });
    }

    return {
        processInChunks
    };
})();

// expose
window.PerformanceUtils = PerformanceUtils;
export default PerformanceUtils;
