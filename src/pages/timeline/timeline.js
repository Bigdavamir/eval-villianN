document.addEventListener('DOMContentLoaded', () => {
    const timelineContainer = document.getElementById('timeline-container');
    const refreshBtn = document.getElementById('refresh-btn');
    const clearBtn = document.getElementById('clear-btn');

    const EV_TIMELINE_KEY = 'evalvillain_timeline';

    function escapeHtml(unsafe) {
        if (unsafe === null || unsafe === undefined) return '';
        // For the timeline, we can be a bit more lenient than strict escaping
        // as we want to see the structure. This is not for innerHTML on the main page.
        return unsafe.toString()
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
    }

    function renderTimeline(events) {
        timelineContainer.innerHTML = '';
        if (!events || events.length === 0) {
            timelineContainer.innerHTML = '<p>No events recorded yet. Interact with a page to generate events.</p>';
            return;
        }

        // Display latest events first
        for (const event of events.slice().reverse()) {
            const eventEl = document.createElement('div');
            eventEl.className = `timeline-event event-${event.type}`;

            const header = `
                <div class="event-header">
                    <span class="event-type event-type-${event.type}">${escapeHtml(event.type.toUpperCase())}</span>
                    <span class="event-timestamp">${new Date(event.timestamp).toLocaleString()}</span>
                </div>`;

            let details = '<dl class="event-details">';
            if (event.type === 'source') {
                details += `
                    <dt>Display Name</dt><dd>${escapeHtml(event.sourceDisplay)}</dd>
                    <dt>Source Type</dt><dd>${escapeHtml(event.sourceType)}</dd>
                    <dt>Origin</dt><dd>${escapeHtml(event.origin)}</dd>
                    <dt>Value</dt><dd>${escapeHtml(event.sourceValue)}</dd>
                `;
                if (event.decode) {
                    details += `<dt>Decoder</dt><dd>${escapeHtml(event.decode)}</dd>`;
                }
            } else if (event.type === 'sink') {
                details += `
                    <dt>Sink Name</dt><dd>${escapeHtml(event.sinkName)}</dd>
                    <dt>Origin</dt><dd>${escapeHtml(event.origin)}</dd>
                    <dt>Arguments</dt><dd>${escapeHtml(JSON.stringify(event.sinkArgs, null, 2))}</dd>
                `;
                if (event.sources && event.sources.length > 0) {
                     details += `<dt>Sources Found</dt><dd style="background-color: transparent; padding: 0;">`;
                     event.sources.forEach(source => {
                         details += `
                            <div class="source-in-sink">
                                <dl class="event-details">
                                    <dt>Source Type</dt><dd>${escapeHtml(source.sourceType)}</dd>
                                    <dt>Value</dt><dd>${escapeHtml(source.sourceValue || 'N/A')}</dd>
                                    <dt>From Arg</dt><dd>${escapeHtml(source.argNum)}</dd>
                                    <dt>Source Origin</dt><dd>${escapeHtml(source.sourceOrigin || 'N/A')}</dd>
                                    <dt>Ingested At</dt><dd>${source.sourceTimestamp ? new Date(source.sourceTimestamp).toLocaleString() : 'N/A'}</dd>
                                </dl>
                            </div>
                         `;
                     });
                     details += `</dd>`;
                }
            }
            details += '</dl>';
            eventEl.innerHTML = header + details;
            timelineContainer.appendChild(eventEl);
        }
    }

    function loadTimeline() {
        browser.storage.local.get(EV_TIMELINE_KEY, (result) => {
            renderTimeline(result[EV_TIMELINE_KEY]);
        });
    }

    refreshBtn.addEventListener('click', loadTimeline);

    clearBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear all timeline events? This action cannot be undone.')) {
            browser.storage.local.remove(EV_TIMELINE_KEY, () => {
                loadTimeline();
            });
        }
    });

    // Initial load
    loadTimeline();
});
