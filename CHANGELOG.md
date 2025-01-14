# CHANGELOG

## 2025-01-14

Down again as of two days ago, database backup job failing

https://github.com/magus/mono/actions/runs/12765918013/job/35581146888

```log
dokku run hasura pg_dump *** --no-owner --no-acl --data-only --schema public > data.sql
ls -lsah

======END======
err:  !     App image (dokku/hasura:latest) not found
err: Error: No such image:
err:  !     Invalid image stage detected: expected 'release', got ''
err:  !     Successfully deploy your app to fix dokku run calls
```

ssh into the box and manually run below, fixes the issue immediately

```bash
dokku ps:rebuild hasura
```

Digging into root cause.
cron restart seems to be failing, and in the logs I noticed the unrand cache query failing with 500

```bash
cat /var/log/cronlog


parallel: This job failed:
/var/lib/dokku/plugins/available/scheduler-docker-local/bin/scheduler-deploy-process-container hasura dockerfile dokku/hasura:latest latest web 1 1
 !     exit status 1
[2025-01-11T20:42:01][/home/dokku/hasura/restart.sh] Restarting instance
-----> Deploying web (count=1)
       Attempting pre-flight checks (web.1)
       Waiting for 10 seconds (web.1)
3e7321a8542624d3dde1c73e083c91362fb3a3604c18a27b2b9358210e287ccc
 !     App container failed to start (web.1)
=====> Start of hasura container output (web.1)
       {"detail":{"info":{"admin_secret_set":true,"auth_hook":null,"auth_hook_mode":null,"console_assets_dir":null,"console_sentry_dsn":null,"cors_config":{"allowed_origins":"*","disabled":false,"ws_read_cookie":null},"enable_allowlist":false,"enable_console":true,"enable_maintenance_mode":false,"enable_metadata_query_logging":false,"enable_telemetry":true,"enabled_apis":["metadata","pgdump","graphql"],"enabled_log_types":["startup","http-log","jwk-refresh-log","webhook-log","websocket-log"],"events_fetch_batch_size":100,"experimental_features":[],"graceful_shutdown_timeout":60,"http_log_query_only_on_error":false,"infer_function_permissions":true,"jwt_secret":[{"audience":null,"claims_format":"json","claims_namespace":"https://hasura.io/jwt/claims","header":null,"issuer":null,"key":"<JWK REDACTED>","type":"<TYPE REDACTED>"}],"live_query_options":{"batch_size":100,"refetch_delay":1},"log_level":"info","port":8080,"remote_schema_permissions":false,"server_host":"HostAny","stringify_numeric_types":false,"transaction_isolation":"ISOLATION LEVEL READ COMMITTED","unauth_role":"anonymous","use_prepared_statements":true,"v1-boolean-null-collapse":false,"websocket_compression_options":"NoCompression","websocket_connection_init_timeout":"Refined (Seconds {seconds = 3s})","websocket_keep_alive":"KeepAliveDelay {unKeepAliveDelay = Refined (Seconds {seconds = 5s})}"},"kind":"server_configuration"},"level":"info","timestamp":"2025-01-11T20:42:12.272+0000","type":"startup"}
       {"detail":{"info":{"database_url":"postgres://postgres:...@dokku-postgres-hasura-db:5432/hasura_db","retries":1},"kind":"postgres_connection"},"level":"info","timestamp":"2025-01-11T20:42:12.272+0000","type":"startup"}
       {"detail":{"info":"Already at the latest catalog version (48); nothing to do.","kind":"catalog_migrate"},"level":"info","timestamp":"2025-01-11T20:42:12.272+0000","type":"startup"}
       {"detail":{"info":"Schema sync enabled. Polling at Refined (Milliseconds {milliseconds = 1s})","kind":"schema-sync"},"level":"info","timestamp":"2025-01-11T20:42:13.305+0000","type":"startup"}
       {"detail":{"info":{"instance_id":"664b9216-49f9-4ac8-8a31-33dfa52e0b53","message":"listener thread started","thread_id":"ThreadId 24"},"kind":"schema-sync"},"level":"info","timestamp":"2025-01-11T20:42:13.305+0000","type":"startup"}
       {"detail":"Thread SchemeUpdate.listener (re)started","level":"info","timestamp":"2025-01-11T20:42:13.305+0000","type":"unstructured"}
       {"detail":"Thread ourIdleGC (re)started","level":"info","timestamp":"2025-01-11T20:42:13.305+0000","type":"unstructured"}
       {"detail":{"info":"EE client credentials not present in the metadata database. Hasura EE features are disabled.","kind":"license_info"},"level":"warn","timestamp":"2025-01-11T20:42:13.305+0000","type":"startup"}
       {"detail":{"info":{"message":"source \"default\" is already at the latest catalog version (3).","source":"default"},"kind":"source_catalog_migrate"},"level":"info","timestamp":"2025-01-11T20:42:15.332+0000","type":"startup"}
       {"detail":"Thread SchemeUpdate.processor (re)started","level":"info","timestamp":"2025-01-11T20:42:16.350+0000","type":"unstructured"}
       {"detail":{"info":{"instance_id":"664b9216-49f9-4ac8-8a31-33dfa52e0b53","message":"processor thread started","thread_id":"ThreadId 64"},"kind":"schema-sync"},"level":"info","timestamp":"2025-01-11T20:42:16.350+0000","type":"startup"}
       {"detail":{"info":"Starting in eventing enabled mode","kind":"server"},"level":"info","timestamp":"2025-01-11T20:42:16.350+0000","type":"startup"}
       {"detail":{"info":"Starting workers","kind":"event_triggers"},"level":"info","timestamp":"2025-01-11T20:42:16.350+0000","type":"startup"}
       {"detail":"Thread processEventQueue (re)started","level":"info","timestamp":"2025-01-11T20:42:16.350+0000","type":"unstructured"}
       {"detail":"Thread asyncActionsProcessor (re)started","level":"info","timestamp":"2025-01-11T20:42:16.350+0000","type":"unstructured"}
       {"detail":"Thread asyncActionSubscriptionsProcessor (re)started","level":"info","timestamp":"2025-01-11T20:42:16.350+0000","type":"unstructured"}
       {"detail":"Thread runCronEventsGenerator (re)started","level":"info","timestamp":"2025-01-11T20:42:16.350+0000","type":"unstructured"}
       {"detail":"Thread processScheduledTriggers (re)started","level":"info","timestamp":"2025-01-11T20:42:16.350+0000","type":"unstructured"}
       {"detail":{"info":"Unlocking all locked scheduled events on `hdb_scheduled_events` and `hdb_cron_events` tables","kind":"scheduled_triggers"},"level":"info","timestamp":"2025-01-11T20:42:16.350+0000","type":"startup"}
       {"detail":"Thread checkForUpdates (re)started","level":"info","timestamp":"2025-01-11T20:42:16.350+0000","type":"unstructured"}
       {"detail":"Thread sourcePingPoller (re)started","level":"info","timestamp":"2025-01-11T20:42:16.350+0000","type":"unstructured"}
       {"detail":"Thread websocketConnectionReaper (re)started","level":"info","timestamp":"2025-01-11T20:42:16.350+0000","type":"unstructured"}
       {"detail":{"info":"Help us improve Hasura! The graphql-engine server collects anonymized usage stats which allows us to keep improving Hasura at warp speed. To read more or opt-out, visit https://hasura.io/docs/latest/graphql/core/guides/telemetry.html","kind":"telemetry"},"level":"info","timestamp":"2025-01-11T20:42:16.350+0000","type":"startup"}
       {"detail":"Thread runTelemetry (re)started","level":"info","timestamp":"2025-01-11T20:42:16.350+0000","type":"unstructured"}
       {"detail":"Thread updateJWK (re)started","level":"info","timestamp":"2025-01-11T20:42:16.350+0000","type":"unstructured"}
       {"detail":{"info":{"message":"Starting API server","time_taken":4.829965874},"kind":"server"},"level":"info","timestamp":"2025-01-11T20:42:16.350+0000","type":"startup"}
       {"detail":{"http_error":{"http_exception":null,"response":"{\"error\":\"invalid_payload\"}","status_code":400,"url":"https://telemetry.hasura.io/v1/http"},"message":"failed to post telemetry","type":"http_error"},"level":"info","timestamp":"2025-01-11T20:42:16.350+0000","type":"telemetry-log"}
       {"detail":{"http_info":{"content_encoding":null,"http_version":"HTTP/1.1","ip":"127.0.0.1","method":"GET","status":200,"url":"/healthz"},"operation":{"query":{"type":null},"request_id":"ddefc199-2d9c-49b4-abc0-52b24099e160","request_mode":"non-graphql","response_size":2,"uncompressed_response_size":2},"request_id":"ddefc199-2d9c-49b4-abc0-52b24099e160"},"level":"info","timestamp":"2025-01-11T20:42:52.656+0000","type":"http-log"}
       {"detail":{"event_id":"9e61c47e-ee59-42af-bbe2-0a98239dabcc","event_name":"dcsseeds_scrapePlayers_unrand_cache","request":{"original_request":{"body":"{\"comment\":\"\",\"id\":\"9e61c47e-ee59-42af-bbe2-0a98239dabcc\",\"name\":\"dcsseeds_scrapePlayers_unrand_cache\",\"payload\":{},\"scheduled_time\":\"2025-01-11T20:45:00Z\"}","headers":{"Content-Type":"application/json","User-Agent":"hasura-graphql-engine/v2.45.1"},"method":"POST","query_string":"?window_size=5","response_timeout":"60000000","url":"https://dcss.vercel.app/api/cache_unrand_query?window_size=5"},"original_size":156,"req_transform_ctx":null,"session_vars":null,"transformed_request":null,"transformed_size":null},"response":{"detail":{"body":"{\n  \"data\": {\n    \"times\": [[\"all unrand cache keys\", 6794.774927]],\n    \"error\": {\n      \"message\": \"Cannot read properties of undefined (reading 'name')\",\n      \"stack\": [\n        \"TypeError: Cannot read properties of undefined (reading 'name')\",\n        \"    at SeedVersionFilter (/var/task/.next/server/pages/api/cache_unrand_query.js:225:43)\",\n        \"    at /var/task/.next/server/pages/api/cache_unrand_query.js:139:14\",\n        \"    at Array.map (<anonymous>)\",\n        \"    at handler (/var/task/.next/server/pages/api/cache_unrand_query.js:137:30)\",\n        \"    at process.processTicksAndRejections (node:internal/process/task_queues:95:5)\",\n        \"    at async /var/task/node_modules/.pnpm/@sentry+nextjs@7.120.0_next@12.3.4_@babel+core@7.26.0_react-dom@17.0.2_react@17.0.2__react@17.0.2__react@17.0.2/node_modules/@sentry/nextjs/cjs/common/wrapApiHandlerWithSentry.js:136:41\",\n        \"    at async Object.apiResolver (/var/task/node_modules/.pnpm/next@12.3.4_@babel+core@7.26.0_react-dom@17.0.2_react@17.0.2__react@17.0.2/node_modules/next/dist/server/api-utils/node.js:366:9)\",\n        \"    at async NextNodeServer.runApi (/var/task/node_modules/.pnpm/next@12.3.4_@babel+core@7.26.0_react-dom@17.0.2_react@17.0.2__react@17.0.2/node_modules/next/dist/server/next-server.js:481:9)\",\n        \"    at async Object.fn (/var/task/node_modules/.pnpm/next@12.3.4_@babel+core@7.26.0_react-dom@17.0.2_react@17.0.2__react@17.0.2/node_modules/next/dist/server/next-server.js:741:37)\",\n        \"    at async Router.execute (/var/task/node_modules/.pnpm/next@12.3.4_@babel+core@7.26.0_react-dom@17.0.2_react@17.0.2__react@17.0.2/node_modules/next/dist/server/router.js:252:36)\"\n      ]\n    },\n    \"report\": {\n      \"window_size\": 5,\n      \"param_unrand\": [null],\n      \"update_list\": [null],\n      \"missing_keys\": []\n    }\n  },\n  \"error\": true\n}\n","headers":[{"name":"Access-Control-Allow-Origin","value":"https://dcss.vercel.app"},{"name":"Cache-Control","value":"public, max-age=0, must-revalidate"},{"name":"Content-Length","value":"1850"},{"name":"Content-Type","value":"application/json"},{"name":"Date","value":"Sat, 11 Jan 2025 20:45:18 GMT"},{"name":"Permissions-Policy","value":"camera=(), microphone=(), geolocation=()"},{"name":"Referrer-Policy","value":"strict-origin-when-cross-origin"},{"name":"Server","value":"Vercel"},{"name":"Strict-Transport-Security","value":"max-age=31536000; includeSubDomains; preload"},{"name":"X-Content-Type-Options","value":"nosniff"},{"name":"X-Dns-Prefetch-Control","value":"on"},{"name":"X-Frame-Options","value":"DENY"},{"name":"X-Matched-Path","value":"/api/cache_unrand_query"},{"name":"X-Vercel-Cache","value":"MISS"},{"name":"X-Vercel-Id","value":"iad1::sfo1::5gdjw-1736628311697-92afc3ae6c54"}],"size":1850,"status":500},"type":"status"}},"level":"info","span_id":"90f29dda9ba2d595","timestamp":"2025-01-11T20:45:17.766+0000","trace_id":"9a53ee7e36c36ae8cecb82d21fb3d4b2","type":"scheduled-trigger"}
       Killed
       {"detail":{"info":{"admin_secret_set":true,"auth_hook":null,"auth_hook_mode":null,"console_assets_dir":null,"console_sentry_dsn":null,"cors_config":{"allowed_origins":"*","disabled":false,"ws_read_cookie":null},"enable_allowlist":false,"enable_console":true,"enable_maintenance_mode":false,"enable_metadata_query_logging":false,"enable_telemetry":true,"enabled_apis":["metadata","pgdump","graphql"],"enabled_log_types":["startup","http-log","jwk-refresh-log","webhook-log","websocket-log"],"events_fetch_batch_size":100,"experimental_features":[],"graceful_shutdown_timeout":60,"http_log_query_only_on_error":false,"infer_function_permissions":true,"jwt_secret":[{"audience":null,"claims_format":"json","claims_namespace":"https://hasura.io/jwt/claims","header":null,"issuer":null,"key":"<JWK REDACTED>","type":"<TYPE REDACTED>"}],"live_query_options":{"batch_size":100,"refetch_delay":1},"log_level":"info","port":8080,"remote_schema_permissions":false,"server_host":"HostAny","stringify_numeric_types":false,"transaction_isolation":"ISOLATION LEVEL READ COMMITTED","unauth_role":"anonymous","use_prepared_statements":true,"v1-boolean-null-collapse":false,"websocket_compression_options":"NoCompression","websocket_connection_init_timeout":"Refined (Seconds {seconds = 3s})","websocket_keep_alive":"KeepAliveDelay {unKeepAliveDelay = Refined (Seconds {seconds = 5s})}"},"kind":"server_configuration"},"level":"info","timestamp":"2025-01-11T20:47:00.340+0000","type":"startup"}
       {"detail":{"info":{"database_url":"postgres://postgres:...@dokku-postgres-hasura-db:5432/hasura_db","retries":1},"kind":"postgres_connection"},"level":"info","timestamp":"2025-01-11T20:47:00.340+0000","type":"startup"}
       {"detail":{"info":"Already at the latest catalog version (48); nothing to do.","kind":"catalog_migrate"},"level":"info","timestamp":"2025-01-11T20:47:00.340+0000","type":"startup"}
       {"detail":{"info":"Schema sync enabled. Polling at Refined (Milliseconds {milliseconds = 1s})","kind":"schema-sync"},"level":"info","timestamp":"2025-01-11T20:47:03.501+0000","type":"startup"}
       {"detail":{"info":{"instance_id":"40b44a04-7bfd-4ae8-b56d-95bc1746097f","message":"listener thread started","thread_id":"ThreadId 24"},"kind":"schema-sync"},"level":"info","timestamp":"2025-01-11T20:47:03.501+0000","type":"startup"}
       {"detail":"Thread SchemeUpdate.listener (re)started","level":"info","timestamp":"2025-01-11T20:47:03.501+0000","type":"unstructured"}
       {"detail":{"info":"EE client credentials not present in the metadata database. Hasura EE features are disabled.","kind":"license_info"},"level":"warn","timestamp":"2025-01-11T20:47:03.501+0000","type":"startup"}
       {"detail":"Thread ourIdleGC (re)started","level":"info","timestamp":"2025-01-11T20:47:03.501+0000","type":"unstructured"}
       {"detail":{"info":{"message":"source \"default\" is already at the latest catalog version (3).","source":"default"},"kind":"source_catalog_migrate"},"level":"info","timestamp":"2025-01-11T20:47:13.637+0000","type":"startup"}
       {"detail":"Thread SchemeUpdate.processor (re)started","level":"info","timestamp":"2025-01-11T20:47:14.649+0000","type":"unstructured"}
       {"detail":{"info":{"instance_id":"40b44a04-7bfd-4ae8-b56d-95bc1746097f","message":"processor thread started","thread_id":"ThreadId 79"},"kind":"schema-sync"},"level":"info","timestamp":"2025-01-11T20:47:14.649+0000","type":"startup"}
       {"detail":{"info":"Starting in eventing enabled mode","kind":"server"},"level":"info","timestamp":"2025-01-11T20:47:14.649+0000","type":"startup"}
       {"detail":{"info":"Starting workers","kind":"event_triggers"},"level":"info","timestamp":"2025-01-11T20:47:14.649+0000","type":"startup"}
       {"detail":"Thread processEventQueue (re)started","level":"info","timestamp":"2025-01-11T20:47:14.649+0000","type":"unstructured"}
       {"detail":"Thread asyncActionsProcessor (re)started","level":"info","timestamp":"2025-01-11T20:47:14.649+0000","type":"unstructured"}
       {"detail":"Thread asyncActionSubscriptionsProcessor (re)started","level":"info","timestamp":"2025-01-11T20:47:14.649+0000","type":"unstructured"}
       {"detail":"Thread runCronEventsGenerator (re)started","level":"info","timestamp":"2025-01-11T20:47:14.649+0000","type":"unstructured"}
       {"detail":"Thread processScheduledTriggers (re)started","level":"info","timestamp":"2025-01-11T20:47:14.649+0000","type":"unstructured"}
       {"detail":"Thread checkForUpdates (re)started","level":"info","timestamp":"2025-01-11T20:47:14.649+0000","type":"unstructured"}
       {"detail":{"info":"Unlocking all locked scheduled events on `hdb_scheduled_events` and `hdb_cron_events` tables","kind":"scheduled_triggers"},"level":"info","timestamp":"2025-01-11T20:47:14.649+0000","type":"startup"}
       {"detail":"Thread websocketConnectionReaper (re)started","level":"info","timestamp":"2025-01-11T20:47:14.649+0000","type":"unstructured"}
       {"detail":"Thread sourcePingPoller (re)started","level":"info","timestamp":"2025-01-11T20:47:14.649+0000","type":"unstructured"}
       {"detail":{"info":"Help us improve Hasura! The graphql-engine server collects anonymized usage stats which allows us to keep improving Hasura at warp speed. To read more or opt-out, visit https://hasura.io/docs/latest/graphql/core/guides/telemetry.html","kind":"telemetry"},"level":"info","timestamp":"2025-01-11T20:47:21.001+0000","type":"startup"}
       {"detail":"Thread runTelemetry (re)started","level":"info","timestamp":"2025-01-11T20:47:21.001+0000","type":"unstructured"}
       {"detail":{"info":{"message":"Starting API server","time_taken":22.262227916},"kind":"server"},"level":"info","timestamp":"2025-01-11T20:47:22.074+0000","type":"startup"}
       {"detail":"Thread updateJWK (re)started","level":"info","timestamp":"2025-01-11T20:47:22.074+0000","type":"unstructured"}
       {"detail":{"http_error":{"http_exception":null,"response":"{\"error\":\"invalid_payload\"}","status_code":400,"url":"https://telemetry.hasura.io/v1/http"},"message":"failed to post telemetry","type":"http_error"},"level":"info","timestamp":"2025-01-11T20:47:22.074+0000","type":"telemetry-log"}
=====> End of hasura container output (web.1)
parallel: This job failed:
/var/lib/dokku/plugins/available/scheduler-docker-local/bin/scheduler-deploy-process-container hasura dockerfile dokku/hasura:latest latest web 1 1
 !     exit status 1
[2025-01-12T00:42:01][/home/dokku/hasura/restart.sh] Restarting instance
 !     App image (dokku/hasura:latest) not found
 !     exit status 1
[2025-01-12T04:42:01][/home/dokku/hasura/restart.sh] Restarting instance
 !     App image (dokku/hasura:latest) not found
 !     exit status 1
[2025-01-12T08:42:01][/home/dokku/hasura/restart.sh] Restarting instance
 !     App image (dokku/hasura:latest) not found
 !     exit status 1
[2025-01-12T12:42:01][/home/dokku/hasura/restart.sh] Restarting instance
 !     App image (dokku/hasura:latest) not found
 !     exit status 1
```

So it seems like the job fails to restart and then eventually crashes entirely and is not found.
This is the root cause of why the app seems to be crashing because if it isn't restarted periodically it eventually crashes entirely.

In the output above the command below is failing so I ran it manually and reproduced

```bash
dokku ps:restart hasura

-----> Deploying web (count=1)
       Attempting pre-flight checks (web.1)
       Waiting for 10 seconds (web.1)
84e01f4ba269a119b43fb5b2c77b4eaf37911c837ec9881d7f7b7ea381fecb35
 !     App container failed to start (web.1)
=====> Start of hasura container output (web.1)
       {"detail":{"info":{"admin_secret_set":true,"auth_hook":null,"auth_hook_mode":null,"console_assets_dir":null,"console_sentry_dsn":null,"cors_config":{"allowed_origins":"*","disabled":false,"ws_read_cookie":null},"enable_allowlist":false,"enable_console":true,"enable_maintenance_mode":false,"enable_metadata_query_logging":false,"enable_telemetry":true,"enabled_apis":["metadata","pgdump","graphql"],"enabled_log_types":["startup","http-log","jwk-refresh-log","webhook-log","websocket-log"],"events_fetch_batch_size":100,"experimental_features":[],"graceful_shutdown_timeout":60,"http_log_query_only_on_error":false,"infer_function_permissions":true,"jwt_secret":[{"audience":null,"claims_format":"json","claims_namespace":"https://hasura.io/jwt/claims","header":null,"issuer":null,"key":"<JWK REDACTED>","type":"<TYPE REDACTED>"}],"live_query_options":{"batch_size":100,"refetch_delay":1},"log_level":"info","port":8080,"remote_schema_permissions":false,"server_host":"HostAny","stringify_numeric_types":false,"transaction_isolation":"ISOLATION LEVEL READ COMMITTED","unauth_role":"anonymous","use_prepared_statements":true,"v1-boolean-null-collapse":false,"websocket_compression_options":"NoCompression","websocket_connection_init_timeout":"Refined (Seconds {seconds = 3s})","websocket_keep_alive":"KeepAliveDelay {unKeepAliveDelay = Refined (Seconds {seconds = 5s})}"},"kind":"server_configuration"},"level":"info","timestamp":"2025-01-14T17:46:51.553+0000","type":"startup"}
       {"detail":{"info":{"database_url":"postgres://postgres:...@dokku-postgres-hasura-db:5432/hasura_db","retries":1},"kind":"postgres_connection"},"level":"info","timestamp":"2025-01-14T17:46:51.553+0000","type":"startup"}
       {"detail":{"info":"Already at the latest catalog version (48); nothing to do.","kind":"catalog_migrate"},"level":"info","timestamp":"2025-01-14T17:46:53.573+0000","type":"startup"}
       {"detail":{"info":"Schema sync enabled. Polling at Refined (Milliseconds {milliseconds = 1s})","kind":"schema-sync"},"level":"info","timestamp":"2025-01-14T17:46:55.660+0000","type":"startup"}
       {"detail":{"info":{"instance_id":"44a5cf9a-dd90-473d-8462-f52accb4c711","message":"listener thread started","thread_id":"ThreadId 24"},"kind":"schema-sync"},"level":"info","timestamp":"2025-01-14T17:46:55.660+0000","type":"startup"}
       {"detail":"Thread SchemeUpdate.listener (re)started","level":"info","timestamp":"2025-01-14T17:46:55.660+0000","type":"unstructured"}
       {"detail":{"info":"EE client credentials not present in the metadata database. Hasura EE features are disabled.","kind":"license_info"},"level":"warn","timestamp":"2025-01-14T17:46:55.660+0000","type":"startup"}
       {"detail":"Thread ourIdleGC (re)started","level":"info","timestamp":"2025-01-14T17:46:55.660+0000","type":"unstructured"}
       {"detail":{"info":{"message":"source \"default\" is already at the latest catalog version (3).","source":"default"},"kind":"source_catalog_migrate"},"level":"info","timestamp":"2025-01-14T17:47:05.559+0000","type":"startup"}
       {"detail":{"info":{"instance_id":"44a5cf9a-dd90-473d-8462-f52accb4c711","message":"processor thread started","thread_id":"ThreadId 83"},"kind":"schema-sync"},"level":"info","timestamp":"2025-01-14T17:47:11.832+0000","type":"startup"}
       {"detail":{"info":"Starting in eventing enabled mode","kind":"server"},"level":"info","timestamp":"2025-01-14T17:47:11.832+0000","type":"startup"}
       {"detail":"Thread SchemeUpdate.processor (re)started","level":"info","timestamp":"2025-01-14T17:47:11.832+0000","type":"unstructured"}
       {"detail":{"info":"Starting workers","kind":"event_triggers"},"level":"info","timestamp":"2025-01-14T17:47:11.832+0000","type":"startup"}
       {"detail":"Thread processEventQueue (re)started","level":"info","timestamp":"2025-01-14T17:47:11.832+0000","type":"unstructured"}
       {"detail":"Thread asyncActionSubscriptionsProcessor (re)started","level":"info","timestamp":"2025-01-14T17:47:11.832+0000","type":"unstructured"}
       {"detail":"Thread asyncActionsProcessor (re)started","level":"info","timestamp":"2025-01-14T17:47:11.832+0000","type":"unstructured"}
       {"detail":"Thread runCronEventsGenerator (re)started","level":"info","timestamp":"2025-01-14T17:47:11.832+0000","type":"unstructured"}
       {"detail":"Thread processScheduledTriggers (re)started","level":"info","timestamp":"2025-01-14T17:47:11.832+0000","type":"unstructured"}
       {"detail":{"info":"Unlocking all locked scheduled events on `hdb_scheduled_events` and `hdb_cron_events` tables","kind":"scheduled_triggers"},"level":"info","timestamp":"2025-01-14T17:47:11.832+0000","type":"startup"}
       {"detail":"Thread checkForUpdates (re)started","level":"info","timestamp":"2025-01-14T17:47:11.832+0000","type":"unstructured"}
       {"detail":"Thread websocketConnectionReaper (re)started","level":"info","timestamp":"2025-01-14T17:47:11.832+0000","type":"unstructured"}
       {"detail":"Thread sourcePingPoller (re)started","level":"info","timestamp":"2025-01-14T17:47:11.832+0000","type":"unstructured"}
       {"detail":{"info":"Help us improve Hasura! The graphql-engine server collects anonymized usage stats which allows us to keep improving Hasura at warp speed. To read more or opt-out, visit https://hasura.io/docs/latest/graphql/core/guides/telemetry.html","kind":"telemetry"},"level":"info","timestamp":"2025-01-14T17:47:15.817+0000","type":"startup"}
       {"detail":"Thread runTelemetry (re)started","level":"info","timestamp":"2025-01-14T17:47:15.817+0000","type":"unstructured"}
       {"detail":"Thread updateJWK (re)started","level":"info","timestamp":"2025-01-14T17:47:15.817+0000","type":"unstructured"}
       {"detail":{"info":{"message":"Starting API server","time_taken":25.513117428},"kind":"server"},"level":"info","timestamp":"2025-01-14T17:47:15.817+0000","type":"startup"}
       {"detail":{"http_error":{"http_exception":null,"response":"{\"error\":\"invalid_payload\"}","status_code":400,"url":"https://telemetry.hasura.io/v1/http"},"message":"failed to post telemetry","type":"http_error"},"level":"info","timestamp":"2025-01-14T17:47:15.817+0000","type":"telemetry-log"}
       {"detail":{"http_info":{"content_encoding":null,"http_version":"HTTP/1.1","ip":"127.0.0.1","method":"GET","status":200,"url":"/healthz"},"operation":{"query":{"type":null},"request_id":"a042f680-59eb-4309-9b78-e3ec5b4bc368","request_mode":"non-graphql","response_size":2,"uncompressed_response_size":2},"request_id":"a042f680-59eb-4309-9b78-e3ec5b4bc368"},"level":"info","timestamp":"2025-01-14T17:47:18.827+0000","type":"http-log"}
       Killed
       {"detail":{"info":{"admin_secret_set":true,"auth_hook":null,"auth_hook_mode":null,"console_assets_dir":null,"console_sentry_dsn":null,"cors_config":{"allowed_origins":"*","disabled":false,"ws_read_cookie":null},"enable_allowlist":false,"enable_console":true,"enable_maintenance_mode":false,"enable_metadata_query_logging":false,"enable_telemetry":true,"enabled_apis":["metadata","pgdump","graphql"],"enabled_log_types":["startup","http-log","jwk-refresh-log","webhook-log","websocket-log"],"events_fetch_batch_size":100,"experimental_features":[],"graceful_shutdown_timeout":60,"http_log_query_only_on_error":false,"infer_function_permissions":true,"jwt_secret":[{"audience":null,"claims_format":"json","claims_namespace":"https://hasura.io/jwt/claims","header":null,"issuer":null,"key":"<JWK REDACTED>","type":"<TYPE REDACTED>"}],"live_query_options":{"batch_size":100,"refetch_delay":1},"log_level":"info","port":8080,"remote_schema_permissions":false,"server_host":"HostAny","stringify_numeric_types":false,"transaction_isolation":"ISOLATION LEVEL READ COMMITTED","unauth_role":"anonymous","use_prepared_statements":true,"v1-boolean-null-collapse":false,"websocket_compression_options":"NoCompression","websocket_connection_init_timeout":"Refined (Seconds {seconds = 3s})","websocket_keep_alive":"KeepAliveDelay {unKeepAliveDelay = Refined (Seconds {seconds = 5s})}"},"kind":"server_configuration"},"level":"info","timestamp":"2025-01-14T17:48:59.186+0000","type":"startup"}
       {"detail":{"info":{"database_url":"postgres://postgres:...@dokku-postgres-hasura-db:5432/hasura_db","retries":1},"kind":"postgres_connection"},"level":"info","timestamp":"2025-01-14T17:48:59.186+0000","type":"startup"}
       {"detail":{"info":"Already at the latest catalog version (48); nothing to do.","kind":"catalog_migrate"},"level":"info","timestamp":"2025-01-14T17:49:00.205+0000","type":"startup"}
       {"detail":{"info":"Schema sync enabled. Polling at Refined (Milliseconds {milliseconds = 1s})","kind":"schema-sync"},"level":"info","timestamp":"2025-01-14T17:49:01.219+0000","type":"startup"}
       {"detail":{"info":{"instance_id":"4c3961c7-dbc3-420a-b54f-d9f864672365","message":"listener thread started","thread_id":"ThreadId 24"},"kind":"schema-sync"},"level":"info","timestamp":"2025-01-14T17:49:01.219+0000","type":"startup"}
       {"detail":"Thread SchemeUpdate.listener (re)started","level":"info","timestamp":"2025-01-14T17:49:01.219+0000","type":"unstructured"}
       {"detail":"Thread ourIdleGC (re)started","level":"info","timestamp":"2025-01-14T17:49:01.219+0000","type":"unstructured"}
       {"detail":{"info":"EE client credentials not present in the metadata database. Hasura EE features are disabled.","kind":"license_info"},"level":"warn","timestamp":"2025-01-14T17:49:01.219+0000","type":"startup"}
       {"detail":{"info":{"message":"source \"default\" is already at the latest catalog version (3).","source":"default"},"kind":"source_catalog_migrate"},"level":"info","timestamp":"2025-01-14T17:49:22.527+0000","type":"startup"}
       {"detail":{"info":{"instance_id":"4c3961c7-dbc3-420a-b54f-d9f864672365","message":"processor thread started","thread_id":"ThreadId 118"},"kind":"schema-sync"},"level":"info","timestamp":"2025-01-14T17:49:29.712+0000","type":"startup"}
       {"detail":{"info":"Starting in eventing enabled mode","kind":"server"},"level":"info","timestamp":"2025-01-14T17:49:29.712+0000","type":"startup"}
       {"detail":"Thread SchemeUpdate.processor (re)started","level":"info","timestamp":"2025-01-14T17:49:29.712+0000","type":"unstructured"}
       {"detail":{"info":"Starting workers","kind":"event_triggers"},"level":"info","timestamp":"2025-01-14T17:49:29.712+0000","type":"startup"}
       {"detail":"Thread processEventQueue (re)started","level":"info","timestamp":"2025-01-14T17:49:29.712+0000","type":"unstructured"}
       {"detail":"Thread asyncActionsProcessor (re)started","level":"info","timestamp":"2025-01-14T17:49:29.712+0000","type":"unstructured"}
       {"detail":"Thread asyncActionSubscriptionsProcessor (re)started","level":"info","timestamp":"2025-01-14T17:49:29.712+0000","type":"unstructured"}
       {"detail":"Thread runCronEventsGenerator (re)started","level":"info","timestamp":"2025-01-14T17:49:29.712+0000","type":"unstructured"}
       {"detail":"Thread processScheduledTriggers (re)started","level":"info","timestamp":"2025-01-14T17:49:29.712+0000","type":"unstructured"}
       {"detail":{"info":"Unlocking all locked scheduled events on `hdb_scheduled_events` and `hdb_cron_events` tables","kind":"scheduled_triggers"},"level":"info","timestamp":"2025-01-14T17:49:29.712+0000","type":"startup"}
       {"detail":"Thread checkForUpdates (re)started","level":"info","timestamp":"2025-01-14T17:49:29.712+0000","type":"unstructured"}
       {"detail":"Thread sourcePingPoller (re)started","level":"info","timestamp":"2025-01-14T17:49:29.712+0000","type":"unstructured"}
       {"detail":"Thread websocketConnectionReaper (re)started","level":"info","timestamp":"2025-01-14T17:49:29.712+0000","type":"unstructured"}
       {"detail":{"info":"Help us improve Hasura! The graphql-engine server collects anonymized usage stats which allows us to keep improving Hasura at warp speed. To read more or opt-out, visit https://hasura.io/docs/latest/graphql/core/guides/telemetry.html","kind":"telemetry"},"level":"info","timestamp":"2025-01-14T17:49:32.014+0000","type":"startup"}
       {"detail":"Thread runTelemetry (re)started","level":"info","timestamp":"2025-01-14T17:49:32.014+0000","type":"unstructured"}
       {"detail":{"info":{"message":"Starting API server","time_taken":36.659100912},"kind":"server"},"level":"info","timestamp":"2025-01-14T17:49:32.014+0000","type":"startup"}
       {"detail":"Thread updateJWK (re)started","level":"info","timestamp":"2025-01-14T17:49:32.014+0000","type":"unstructured"}
       {"detail":{"http_error":{"http_exception":null,"response":"{\"error\":\"invalid_payload\"}","status_code":400,"url":"https://telemetry.hasura.io/v1/http"},"message":"failed to post telemetry","type":"http_error"},"level":"info","timestamp":"2025-01-14T17:49:33.025+0000","type":"telemetry-log"}
       {"detail":{"http_info":{"content_encoding":null,"http_version":"HTTP/1.1","ip":"127.0.0.1","method":"GET","status":200,"url":"/healthz"},"operation":{"query":{"type":null},"request_id":"9d966b4e-ae55-46c5-9367-269417bcbf39","request_mode":"non-graphql","response_size":2,"uncompressed_response_size":2},"request_id":"9d966b4e-ae55-46c5-9367-269417bcbf39"},"level":"info","timestamp":"2025-01-14T17:49:33.025+0000","type":"http-log"}
       Killed
       {"detail":{"info":{"admin_secret_set":true,"auth_hook":null,"auth_hook_mode":null,"console_assets_dir":null,"console_sentry_dsn":null,"cors_config":{"allowed_origins":"*","disabled":false,"ws_read_cookie":null},"enable_allowlist":false,"enable_console":true,"enable_maintenance_mode":false,"enable_metadata_query_logging":false,"enable_telemetry":true,"enabled_apis":["metadata","pgdump","graphql"],"enabled_log_types":["startup","http-log","jwk-refresh-log","webhook-log","websocket-log"],"events_fetch_batch_size":100,"experimental_features":[],"graceful_shutdown_timeout":60,"http_log_query_only_on_error":false,"infer_function_permissions":true,"jwt_secret":[{"audience":null,"claims_format":"json","claims_namespace":"https://hasura.io/jwt/claims","header":null,"issuer":null,"key":"<JWK REDACTED>","type":"<TYPE REDACTED>"}],"live_query_options":{"batch_size":100,"refetch_delay":1},"log_level":"info","port":8080,"remote_schema_permissions":false,"server_host":"HostAny","stringify_numeric_types":false,"transaction_isolation":"ISOLATION LEVEL READ COMMITTED","unauth_role":"anonymous","use_prepared_statements":true,"v1-boolean-null-collapse":false,"websocket_compression_options":"NoCompression","websocket_connection_init_timeout":"Refined (Seconds {seconds = 3s})","websocket_keep_alive":"KeepAliveDelay {unKeepAliveDelay = Refined (Seconds {seconds = 5s})}"},"kind":"server_configuration"},"level":"info","timestamp":"2025-01-14T17:50:19.206+0000","type":"startup"}
       {"detail":{"info":{"database_url":"postgres://postgres:...@dokku-postgres-hasura-db:5432/hasura_db","retries":1},"kind":"postgres_connection"},"level":"info","timestamp":"2025-01-14T17:50:19.206+0000","type":"startup"}
       {"detail":{"info":"Already at the latest catalog version (48); nothing to do.","kind":"catalog_migrate"},"level":"info","timestamp":"2025-01-14T17:50:20.222+0000","type":"startup"}
       {"detail":{"info":"Schema sync enabled. Polling at Refined (Milliseconds {milliseconds = 1s})","kind":"schema-sync"},"level":"info","timestamp":"2025-01-14T17:50:21.279+0000","type":"startup"}
       {"detail":{"info":{"instance_id":"3ac7ccaf-96ae-4ab3-965d-c3b5883276d9","message":"listener thread started","thread_id":"ThreadId 24"},"kind":"schema-sync"},"level":"info","timestamp":"2025-01-14T17:50:21.279+0000","type":"startup"}
       {"detail":"Thread SchemeUpdate.listener (re)started","level":"info","timestamp":"2025-01-14T17:50:21.279+0000","type":"unstructured"}
       {"detail":"Thread ourIdleGC (re)started","level":"info","timestamp":"2025-01-14T17:50:21.279+0000","type":"unstructured"}
       {"detail":{"info":"EE client credentials not present in the metadata database. Hasura EE features are disabled.","kind":"license_info"},"level":"warn","timestamp":"2025-01-14T17:50:21.279+0000","type":"startup"}
       {"detail":{"info":{"message":"source \"default\" is already at the latest catalog version (3).","source":"default"},"kind":"source_catalog_migrate"},"level":"info","timestamp":"2025-01-14T17:50:35.516+0000","type":"startup"}
       {"detail":{"info":{"instance_id":"3ac7ccaf-96ae-4ab3-965d-c3b5883276d9","message":"processor thread started","thread_id":"ThreadId 101"},"kind":"schema-sync"},"level":"info","timestamp":"2025-01-14T17:50:40.672+0000","type":"startup"}
       {"detail":{"info":"Starting in eventing enabled mode","kind":"server"},"level":"info","timestamp":"2025-01-14T17:50:40.672+0000","type":"startup"}
       {"detail":"Thread SchemeUpdate.processor (re)started","level":"info","timestamp":"2025-01-14T17:50:40.672+0000","type":"unstructured"}
       {"detail":{"info":"Starting workers","kind":"event_triggers"},"level":"info","timestamp":"2025-01-14T17:50:40.672+0000","type":"startup"}
       {"detail":"Thread processEventQueue (re)started","level":"info","timestamp":"2025-01-14T17:50:40.672+0000","type":"unstructured"}
       {"detail":"Thread asyncActionsProcessor (re)started","level":"info","timestamp":"2025-01-14T17:50:40.672+0000","type":"unstructured"}
       {"detail":"Thread asyncActionSubscriptionsProcessor (re)started","level":"info","timestamp":"2025-01-14T17:50:40.672+0000","type":"unstructured"}
       {"detail":"Thread runCronEventsGenerator (re)started","level":"info","timestamp":"2025-01-14T17:50:40.672+0000","type":"unstructured"}
       {"detail":"Thread processScheduledTriggers (re)started","level":"info","timestamp":"2025-01-14T17:50:40.672+0000","type":"unstructured"}
       {"detail":{"info":"Unlocking all locked scheduled events on `hdb_scheduled_events` and `hdb_cron_events` tables","kind":"scheduled_triggers"},"level":"info","timestamp":"2025-01-14T17:50:40.672+0000","type":"startup"}
       {"detail":"Thread checkForUpdates (re)started","level":"info","timestamp":"2025-01-14T17:50:40.672+0000","type":"unstructured"}
       {"detail":"Thread sourcePingPoller (re)started","level":"info","timestamp":"2025-01-14T17:50:40.672+0000","type":"unstructured"}
       {"detail":"Thread websocketConnectionReaper (re)started","level":"info","timestamp":"2025-01-14T17:50:40.672+0000","type":"unstructured"}
=====> End of hasura container output (web.1)
parallel: This job failed:
/var/lib/dokku/plugins/available/scheduler-docker-local/bin/scheduler-deploy-process-container hasura dockerfile dokku/hasura:latest latest web 1 1
 !     exit status 1
```

but output isn't identical, sometimes I notice below

```
{"detail":{"event_id":"9e61c47e-ee59-42af-bbe2-0a98239dabcc","event_name":"dcsseeds_scrapePlayers_unrand_cache","request":{"original_request":{"body":"{\"comment\":\"\",\"id\":\"9e61c47e-ee59-42af-bbe2-0a98239dabcc\",\"name\":\"dcsseeds_scrapePlayers_unrand_cache\",\"payload\":{},\"scheduled_time\":\"2025-01-11T20:45:00Z\"}","headers":{"Content-Type":"application/json","User-Agent":"hasura-graphql-engine/v2.45.1"},"method":"POST","query_string":"?window_size=5","response_timeout":"60000000","url":"https://dcss.vercel.app/api/cache_unrand_query?window_size=5"},"original_size":156,"req_transform_ctx":null,"session_vars":null,"transformed_request":null,"transformed_size":null},"response":{"detail":{"body":"{\n  \"data\": {\n    \"times\": [[\"all unrand cache keys\", 6794.774927]],\n    \"error\": {\n      \"message\": \"Cannot read properties of undefined (reading 'name')\",\n      \"stack\": [\n        \"TypeError: Cannot read properties of undefined (reading 'name')\",\n        \"    at SeedVersionFilter (/var/task/.next/server/pages/api/cache_unrand_query.js:225:43)\",\n        \"    at /var/task/.next/server/pages/api/cache_unrand_query.js:139:14\",\n        \"    at Array.map (<anonymous>)\",\n        \"    at handler (/var/task/.next/server/pages/api/cache_unrand_query.js:137:30)\",\n        \"    at process.processTicksAndRejections (node:internal/process/task_queues:95:5)\",\n        \"    at async /var/task/node_modules/.pnpm/@sentry+nextjs@7.120.0_next@12.3.4_@babel+core@7.26.0_react-dom@17.0.2_react@17.0.2__react@17.0.2__react@17.0.2/node_modules/@sentry/nextjs/cjs/common/wrapApiHandlerWithSentry.js:136:41\",\n        \"    at async Object.apiResolver (/var/task/node_modules/.pnpm/next@12.3.4_@babel+core@7.26.0_react-dom@17.0.2_react@17.0.2__react@17.0.2/node_modules/next/dist/server/api-utils/node.js:366:9)\",\n        \"    at async NextNodeServer.runApi (/var/task/node_modules/.pnpm/next@12.3.4_@babel+core@7.26.0_react-dom@17.0.2_react@17.0.2__react@17.0.2/node_modules/next/dist/server/next-server.js:481:9)\",\n        \"    at async Object.fn (/var/task/node_modules/.pnpm/next@12.3.4_@babel+core@7.26.0_react-dom@17.0.2_react@17.0.2__react@17.0.2/node_modules/next/dist/server/next-server.js:741:37)\",\n        \"    at async Router.execute (/var/task/node_modules/.pnpm/next@12.3.4_@babel+core@7.26.0_react-dom@17.0.2_react@17.0.2__react@17.0.2/node_modules/next/dist/server/router.js:252:36)\"\n      ]\n    },\n    \"report\": {\n      \"window_size\": 5,\n      \"param_unrand\": [null],\n      \"update_list\": [null],\n      \"missing_keys\": []\n    }\n  },\n  \"error\": true\n}\n","headers":[{"name":"Access-Control-Allow-Origin","value":"https://dcss.vercel.app"},{"name":"Cache-Control","value":"public, max-age=0, must-revalidate"},{"name":"Content-Length","value":"1850"},{"name":"Content-Type","value":"application/json"},{"name":"Date","value":"Sat, 11 Jan 2025 20:45:18 GMT"},{"name":"Permissions-Policy","value":"camera=(), microphone=(), geolocation=()"},{"name":"Referrer-Policy","value":"strict-origin-when-cross-origin"},{"name":"Server","value":"Vercel"},{"name":"Strict-Transport-Security","value":"max-age=31536000; includeSubDomains; preload"},{"name":"X-Content-Type-Options","value":"nosniff"},{"name":"X-Dns-Prefetch-Control","value":"on"},{"name":"X-Frame-Options","value":"DENY"},{"name":"X-Matched-Path","value":"/api/cache_unrand_query"},{"name":"X-Vercel-Cache","value":"MISS"},{"name":"X-Vercel-Id","value":"iad1::sfo1::5gdjw-1736628311697-92afc3ae6c54"}],"size":1850,"status":500},"type":"status"}},"level":"info","span_id":"90f29dda9ba2d595","timestamp":"2025-01-11T20:45:17.766+0000","trace_id":"9a53ee7e36c36ae8cecb82d21fb3d4b2","type":"scheduled-trigger"}
Killed
```

https://dcss.vercel.app/api/cache_unrand_query?window_size=5

```json
{
  "data": {
    "times": [["all unrand cache keys", 238.097025]],
    "error": {
      "message": "Cannot read properties of undefined (reading 'name')",
      "stack": [
        "TypeError: Cannot read properties of undefined (reading 'name')",
        "    at SeedVersionFilter (/var/task/.next/server/pages/api/cache_unrand_query.js:225:43)",
        "    at /var/task/.next/server/pages/api/cache_unrand_query.js:139:14",
        "    at Array.map (<anonymous>)",
        "    at handler (/var/task/.next/server/pages/api/cache_unrand_query.js:137:30)",
        "    at process.processTicksAndRejections (node:internal/process/task_queues:95:5)",
        "    at async /var/task/node_modules/.pnpm/@sentry+nextjs@7.120.0_next@12.3.4_@babel+core@7.26.0_react-dom@17.0.2_react@17.0.2__react@17.0.2__react@17.0.2/node_modules/@sentry/nextjs/cjs/common/wrapApiHandlerWithSentry.js:136:41",
        "    at async Object.apiResolver (/var/task/node_modules/.pnpm/next@12.3.4_@babel+core@7.26.0_react-dom@17.0.2_react@17.0.2__react@17.0.2/node_modules/next/dist/server/api-utils/node.js:366:9)",
        "    at async NextNodeServer.runApi (/var/task/node_modules/.pnpm/next@12.3.4_@babel+core@7.26.0_react-dom@17.0.2_react@17.0.2__react@17.0.2/node_modules/next/dist/server/next-server.js:481:9)",
        "    at async Object.fn (/var/task/node_modules/.pnpm/next@12.3.4_@babel+core@7.26.0_react-dom@17.0.2_react@17.0.2__react@17.0.2/node_modules/next/dist/server/next-server.js:741:37)",
        "    at async Router.execute (/var/task/node_modules/.pnpm/next@12.3.4_@babel+core@7.26.0_react-dom@17.0.2_react@17.0.2__react@17.0.2/node_modules/next/dist/server/router.js:252:36)"
      ]
    },
    "report": {
      "window_size": 5,
      "param_unrand": [null],
      "update_list": [null],
      "missing_keys": []
    }
  },
  "error": true
}
```

So debugging on prod we notice this query is failing consistently due to `param_unrand` being incorrectly set.
`[null]` can be traced back to this line fixed in the commit below.

https://github.com/magus/dcsseeds/commit/fd5e7ca6798331a6d1c853be56236bf92904b4f7

Turning on dokku tracing to get more details during commands since `dokku ps:restart hasura` seems to be taking a very long time.
Also noticed in a second ssh session running `htop` that the memory usage is maxing out

Also seeing telemetry failures so trying to set this config to disable it below

https://hasura.io/docs/2.0/policies/telemetry/#telemetry-optout

```bash
dokku config:set hasura HASURA_GRAPHQL_ENABLE_TELEMETRY="false"
```

Running dokku commands in general seems very slow, also even stopping the hasura app took a minute or two

```bash
dokku ps:stop hasura
```

hmmm I think the issue might be dangling graphql engine processes?
when i run htop after running `dokku ps:stop hasura` I still see many `graphql-engine serve` processes.

Trying to kill all graphql-engine process does seem to have freed about 200MB of memory

```bash
pkill -f graphql-engine
```

Trying to restart hasura now, seems much faster, even full stop and start cycle seems faster now.
Not sure if killing graphql-engine manually or stopping in general was helpful.

```bash
dokku ps:start hasura

dokku ps:stop hasura
dokku ps:start hasura
```

Trying restart again

```bash
dokku ps:restart hasura
```

Ok restart still hangs also I suspect docker communication may be an issue.
Even `dokku ps:stop hasura` hangs on the `++ get_app_running_container_ids hasura` log line (remember trace is enabled)
Manually running `docker ps` also hangs

```bash
docker ps
CONTAINER ID   IMAGE                 COMMAND                   CREATED         STATUS                   PORTS      NAMES
105385847b6a   dokku/hasura:latest   "/bin/sh -c '\"${HGE_…"   3 minutes ago   Up 2 minutes (healthy)              hasura.web.1.upcoming-20964
693cfb0f2b72   dokku/hasura:latest   "/bin/sh -c '\"${HGE_…"   4 minutes ago   Up 2 minutes (healthy)              hasura.web.1
37d9d9879e52   postgres:11.6         "docker-entrypoint.s…"    20 months ago   Up 9 days                5432/tcp   dokku.postgres.hasura-db
root@magic-auth:~#
```

And clearly there are two instances running which is exactly what we thought and it's not great that its dangling.
Manually removing container for now.

```bash
docker rm -f 105385847b6a
```

Ok for now just going to change the `restart.sh` script to run stop then start instead of restart.

Related commit below

https://github.com/magus/mono/commit/f53ebe760945ad4596e6bef8cf2b24d6d7388b2b

Manually editing the file on disk for now.

```bash
vim /home/dokku/hasura/restart.sh

dokku ps:stop hasura
dokku ps:start hasura
```

## 2025-01-05

magic.iamnoah.com database backup action was failing for 3 days

https://github.com/magus/mono/actions/workflows/magic.iamnoah.com.yml

dcss.vercel.app was down as well as hasura admin panel

Machine looks fine in DigitalOcean, ssh into machine

```bash
ssh root@104.236.34.97

dokku apps:list
dokku ps:report hasura

# hasura app is not running

# rebuild hasura image
dokku git:from-image hasura hasura/graphql-engine
dokku ps:rebuild --all
```

After above things were working fine again, not entirely sure why things were broken though.

Tried to find logs but nothing seems obvious. Something odd is the dangling 9 day old `hasura.web.1.upcoming-19469`

```bash
docker ps

CONTAINER ID   IMAGE                 COMMAND                   CREATED          STATUS                    PORTS      NAMES
30ea31e6ed0b   dokku/hasura:latest   "/bin/sh -c '\"${HGE_…"   18 minutes ago   Up 18 minutes (healthy)              hasura.web.1
33853f9bf088   44ddb2b1197a          "/bin/sh -c '\"${HGE_…"   9 days ago       Up 8 days (healthy)                  hasura.web.1.upcoming-19469
37d9d9879e52   postgres:11.6         "docker-entrypoint.s…"    20 months ago    Up 22 minutes             5432/tcp   dokku.postgres.hasura-db
```

Deleting it manually

```bash
root@magic-auth:~# docker stop 33853f9bf088
33853f9bf088
root@magic-auth:~# docker rm 33853f9bf088
33853f9bf088
root@magic-auth:~# docker ps
CONTAINER ID   IMAGE                 COMMAND                   CREATED          STATUS                        PORTS      NAMES
30ea31e6ed0b   dokku/hasura:latest   "/bin/sh -c '\"${HGE_…"   23 minutes ago   Up About a minute (healthy)              hasura.web.1
37d9d9879e52   postgres:11.6         "docker-entrypoint.s…"    20 months ago    Up 27 minutes                 5432/tcp   dokku.postgres.hasura-db
root@magic-auth:~#
```

## 2024-10-26

- Referencing [2023-05-06](#2023-05-06) entry below for changes to add new version
- Added new `crawl-dir` for `0.31.0` and `0.32.1`
- Update `scripts/AshenzariCurses.ts` with new versions

  ```bash
  yarn tsx ./scripts/AshenzariCurses.ts
  ```

- Copy `scripts/__output__/AshenzariCurses.ts` to `src/utils/AshenzariCurses.ts`
- Create python virtual environment for interacting with dcsseeds crawl source

  ```bash
  python3 -m venv ~/.pyenv/dcsseeds
  source ~/.pyenv/dcsseeds/bin/activate
  pip install pyyaml
  cd crawl-dir/0.31.0/crawl-ref/source
  util/species-gen.py dat/species/ util/species-gen/ species-data.h aptitudes.h species-groups.h species-type.h
  ```

- Reference `crawl-ref/source/species-data.h` and `crawl-ref/source/job-data.h` to update files
- Created `scripts/SpeciesJobData.ts` to programmatically pull all version species and job data
- Required setting up python virtual environment on older version of python for compatability with older crawl version
- Used `~/.pyenv/dcsseeds-3.9` for `0.24.1`

  ```bash
  python3.9 -m venv ~/.pyenv/dcsseeds-3.9
  ```

- **BannedCombos**

  - `0.27.1` and up changed banned combo logic to use starting `MUT_` mutations, no longer hardcoded races
  - `0.24.1` and up used `US_UNDEAD` flag for disabling `JOB_TRANSMUTER`, so double checked that for each version
  - double checked banned combos all versions up to `0.32.1`

- Updated **`NEW_UNRAND_SET`** unrand list in **`src/pages/search/components/ArtifactSearch.js`**
- Manually ran unrand cache query against local server to test with `curl` below

  > https://magic-graphql.iamnoah.com/console/events/cron/dcsseeds_scrapePlayers_unrand_cache/modify

  ```bash
  curl -v "http://localhost:3000/api/cache_unrand_query?window_size=5"
  ```

- `scripts/get_spells` was broken by `0.31.0`

- update `scripts/get_unrands` to use `UNRAND_FLAG_NOGEN` flag to ignore unrands
- update `scripts/get_unrands` to handle changing artefact format `struct unrandart_entry` in `crawl-dir/0.26.1/crawl-ref/source/artefact.h`

- After updating unrand list to remove `UNRAND_FLAG_NOGEN` started seeing errors in api endpoint
- `Cached unrand missing from local Unrands list`
- Need to remove unrand cache rows from database after deploying to production

  ```log
  unrand_key: 'UNRAND_CEREBOV'
  unrand_key: 'UNRAND_DREAMDUST_NECKLACE'
  unrand_key: 'UNRAND_AMULET_INVISIBILITY'
  unrand_key: 'UNRAND_ASMODEUS'
  unrand_key: 'UNRAND_DISPATER_v27'
  unrand_key: 'UNRAND_SCARF_INVISIBILITY'
  unrand_key: 'UNRAND_DRAGONSKIN'
  unrand_key: 'UNRAND_DISPATER'
  unrand_key: 'UNRAND_FAERIE'
  ```

Final result is running scripts below to gather all game updates

```bash
# add new crawl-dir for 0.31.0 + 0.32.1
# update versions to include new 0.31 and 0.32

yarn tsx scripts/AshenzariCurses.ts
# update `src/utils/AshenzariCurses.ts`

yarn tsx scripts/SpeciesJobData.ts
# update species and background variables in `src/Version` files

# update scripts/get_unrands `struct_unrandart_entry` for new version
yarn tsx scripts/get_unrands.ts 0.31.0
yarn tsx scripts/get_unrands.ts 0.32.1
# update unrands variables in `src/Version` files

yarn tsx scripts/build_unrand_list 0.27 0.28 0.29 0.30 0.31 0.32
# update `src/utils/Unrands.js`

# update `NEW_UNRAND_SET` in `src/pages/search/components/ArtifactSearch.js`

yarn tsx scripts/get_spells 0.31.0
yarn tsx scripts/get_spells 0.32.1
# update unrands variables in `src/Version` files

yarn tsx scripts/build_spell_list 0.27 0.28 0.29 0.30 0.31 0.32
# update `src/utils/Spells.js`
```

## 2023-12-03

- Refactor `./scripts/get_spells.js` to take version and handle pre-`0.30.0` format which included effect noise

## 2023-05-27

Finally hit **413 Content Too Large** on the `/` serverless function (`getStaticProps`)

Migrating `cache_unrand_list` to an async call after the page has loaded

## 2023-05-07

> https://www.reddit.com/r/dcss/comments/13aen1l/dcss_search_0300_update/jj6kyuw/

New server `develz`

Had to update `ServerConfig` and also create a new row in `dcsseeds_scrapePlayers_server`

Then called api below via postman successfully which created entries

> http://localhost:3000/api/scrapePlayers/scrapeMorgue?morgue=http://crawl.develz.org/morgues/git/svalbard/morgue-svalbard-20161108-120329.txt

## 2023-05-06

`0.30.0` released on May 5th, going to update with new spells, et al.

> https://crawl.develz.org/wordpress/0-30-the-reavers-return

```sh
# create new 0.30.0 crawl-dir
git clone -b 0.30.0 --depth 1 git@github.com:crawl/crawl.git 0.30.0
git reset 0.30.0
git submodule add -f git@github.com:crawl/crawl.git 0.30.0

# run scripts
yarn tsx ./scripts/AshenzariCurses.ts

# general species files in 0.30.0
cd crawl-dir/0.30.0/crawl-ref/source
util/species-gen.py dat/species/ util/species-gen/ species-data.h aptitudes.h species-groups.h species-type.h
# see species-data.h
# oops realized ghouls + mummy cannot be transmuter
# fixing all versions

# generate unrands for 0.30.0
yarn tsx ./scripts/get_unrands.ts 0.30.0
yarn tsx ./scripts/build_unrand_list 0.27 0.28 0.29 0.30
```

After updating everything, ran local dev to confirm things worked but the `unrand_cache` static props query was failing

Needed to fix so it falls back to handle until the cache eventually updates in production

Updated `rollSeed` api endpoint to roll for latest version by default

Updated `New` page to generate version options dynamically from `Version` metadata

## 2023-05-01

Service hasn't been running for 5 days, cron stopped running 2 days after [below entry](###2023-04-23)

Machine is totally out of disk space, trying to track down culprit, maybe docker images?

Shows many images that are not being used, trying to remove gives error

```sh
root@magic-auth:/usr# docker image ls
REPOSITORY                        TAG             IMAGE ID       CREATED         SIZE
<none>                            <none>          b41db6c4cf2c   2 months ago    528MB
<none>                            <none>          d728f49dc171   2 months ago    528MB
<none>                            <none>          2932e3c5aba8   2 months ago    528MB
dokku/hasura                      latest          44ddb2b1197a   2 months ago    528MB
goacme/lego                       v4.9.1          143f7e37a942   5 months ago    104MB
gliderlabs/herokuish              latest-22       58cf7cef5293   5 months ago    1.02GB
gliderlabs/herokuish              v0.5.40-22      58cf7cef5293   5 months ago    1.02GB
gliderlabs/herokuish              latest-20       597323a1ba3a   5 months ago    1.45GB
gliderlabs/herokuish              v0.5.40-20      597323a1ba3a   5 months ago    1.45GB
gliderlabs/herokuish              latest          686c154e24a2   5 months ago    1.22GB
gliderlabs/herokuish              v0.5.40-18      686c154e24a2   5 months ago    1.22GB
traefik                           v2.8            248ba48e3e90   7 months ago    106MB
timberio/vector                   0.23.X-debian   d782e6717139   8 months ago    199MB
lucaslorentz/caddy-docker-proxy   2.7             59d425d1195e   11 months ago   39.7MB
gliderlabs/herokuish              v0.5.21         56f5e86cd8d7   2 years ago     1.35GB
busybox                           1.31.1-uclibc   1c35c4412082   2 years ago     1.22MB
dokku/wait                        0.4.3           69a95ac9f29b   3 years ago     8.43MB
dokku/s3backup                    0.10.3          840171bc3c78   3 years ago     126MB
dokku/ambassador                  0.3.3           af72d908a0e2   3 years ago     6.97MB
postgres                          11.6            2c963c0eb8c6   3 years ago     332MB
dokku/letsencrypt                 0.1.0           dfdea2d8f7de   3 years ago     86.4MB

root@magic-auth:/usr# docker image rm gliderlabs/herokuish
Error response from daemon: write /var/lib/docker/image/overlay2/.tmp-repositories.json1211884520: no space left on device

root@magic-auth:/usr# du -sh /var/lib/docker
20G	/var/lib/docker
```

Ran below to reclaim ~5GB of space, not enough but its a start

```sh
root@magic-auth:/usr# docker system prune --all
...
Total reclaimed space: 5.844GB
```

```sh
root@magic-auth:/usr# dokku ps:scale hasura web=1
```

Restarting not working... everything is broken probably because I ran the system prune above

Trying to discover what is using so much disk

```sh
cd /var
du -h --max-depth=1 .
cd /var/lib
du -h --max-depth=1 .
cd /var/lib/docker
du -h --max-depth=1 .
cd /var/lib/docker/containers
du -h --max-depth=1 .

root@magic-auth:/var/lib/docker/containers/829c57a27e2972fe37aab2cd24f12627aa118f938303692dd7bbbb2f02840520# ls -lsah
total 12G
4.0K drwx--x--- 4 root root 4.0K Mar 17 06:52 .
4.0K drwx--x--- 4 root root 4.0K May  1 09:47 ..
 12G -rw-r----- 1 root root  12G May  1 09:56 829c57a27e2972fe37aab2cd24f12627aa118f938303692dd7bbbb2f02840520-json.log
4.0K drwx------ 2 root root 4.0K Feb 27 22:55 checkpoints
4.0K -rw------- 1 root root 3.9K Mar 17 06:52 config.v2.json
4.0K -rw------- 1 root root 1.6K Mar 17 06:52 hostconfig.json
4.0K -rw-r--r-- 1 root root   13 Mar 17 06:52 hostname
4.0K -rw-r--r-- 1 root root  174 Mar 17 06:52 hosts
4.0K drwx--x--- 2 root root 4.0K Feb 27 22:55 mounts
4.0K -rw-r--r-- 1 root root  611 Mar 17 06:52 resolv.conf
4.0K -rw-r--r-- 1 root root   71 Mar 17 06:52 resolv.conf.hash
```

There it is `12G` large `829c57a27e2972fe37aab2cd24f12627aa118f938303692dd7bbbb2f02840520-json.log` log file

```sh
root@magic-auth:/var/lib/docker/containers# docker container ls
CONTAINER ID   IMAGE                           COMMAND                   CREATED        STATUS                  PORTS     NAMES
60f33a2f0b19   dokku/hasura:latest             "/bin/sh -c '\"${HGE_…"   5 days ago     Up 5 days (unhealthy)             hasura.web.1
829c57a27e29   timberio/vector:0.23.X-debian   "/usr/bin/vector --c…"    2 months ago   Up 6 weeks                        vector
```

We can see above that `829c57a27e29` corresponds to the vector logging I setup awhile back (approx 2 months ago)

It didn't see to have a file size limit

```sh
root@magic-auth:/var/lib/docker/containers# docker container ls
CONTAINER ID   IMAGE                           COMMAND                  CREATED        STATUS       PORTS     NAMES
829c57a27e29   timberio/vector:0.23.X-debian   "/usr/bin/vector --c…"   2 months ago   Up 6 weeks             vector
root@magic-auth:/var/lib/docker/containers# dokku logs:vector-stop
=====> Stopping and removing vector container
root@magic-auth:/var/lib/docker/containers# docker container ls
CONTAINER ID   IMAGE     COMMAND   CREATED   STATUS    PORTS     NAMES
```

Container is stopped and removed, disk usage on digitial ocean graphs dashboard dropped to 25%

Ok going to try to setup the hasura service again now

```sh
root@magic-auth:~# dokku postgres:stop hasura-db
 !     Service is already stopped
root@magic-auth:~# dokku postgres:start hasura-db
=====> Starting container
       Neither container nor valid configuration exists for hasura-db
root@magic-auth:~# dokku postgres:destroy hasura-db
 !     Cannot delete linked service
```

Seems the postgres container was deleted when I cleared images etc above, going to unlink and destroy it, then recreate it.

> [Instructions are over in magic.iamnoah.com README](https://github.com/magus/mono/blob/master/sites/magic.iamnoah.com/README.md#postgres-database)

```sh
root@magic-auth:~# dokku postgres:unlink hasura-db hasura
 !     Invalid key name: 'DATABASE_URL HASURA_GRAPHQL_DATABASE_URL'
root@magic-auth:~# dokku postgres:destroy hasura-db
 !     WARNING: Potentially Destructive Action
 !     This command will destroy hasura-db Postgres service.
 !     To proceed, type "hasura-db"

> hasura-db
=====> Deleting hasura-db
 !     Service is already stopped
       Removing data
Unable to find image 'busybox:1.31.1-uclibc' locally
1.31.1-uclibc: Pulling from library/busybox
76df9210b28c: Pull complete
Digest: sha256:cd421f41ebaab52ae1ac91a8391ddbd094595264c6e689954b79b3d24ea52f88
Status: Downloaded newer image for busybox:1.31.1-uclibc
=====> Postgres container deleted: hasura-db
root@magic-auth:~# dokku postgres:create hasura-db
root@magic-auth:~# dokku postgres:link hasura-db hasura
-----> Setting config vars
       DOKKU_POSTGRES_AQUA_URL:  postgres://postgres:<PG_PASSWORD>@dokku-postgres-hasura-db:5432/hasura_db
root@magic-auth:~# dokku config:set hasura HASURA_GRAPHQL_DATABASE_URL="postgres://postgres:<PG_PASSWORD>@dokku-postgres-hasura-db:5432/hasura_db"
root@magic-auth:~# dokku config:set hasura HASURA_GRAPHQL_ENABLE_CONSOLE="true"
root@magic-auth:~# dokku ps:scale hasura web=1
```

Visited https://magic-graphql.iamnoah.com/ successfully, now to restore from backups

Last good backup was April 24

Copying `data.sql` and `schema.sql` over to remote machine and install `psql`

```sh
scp data.sql root@104.236.34.97:/root
scp schema.sql root@104.236.34.97:/root
ssh root@104.236.34.97
root@magic-auth:~# dokku postgres:info hasura-db
root@magic-auth:~# psql -h 172.17.0.2 -p 5432 -U root db

Command 'psql' not found, but can be installed with:

apt install postgresql-client-common

root@magic-auth:~# apt install postgresql-client-common
root@magic-auth:~# sudo apt-get install postgresql-client
```

Get the IP address from `docker inspect` below under `NetworkSettings.Networks.bridge.IPAddress`

> https://github.com/dokku/dokku-postgres/issues/80#issuecomment-239265718

```sh
root@magic-auth:~# docker container ls
CONTAINER ID   IMAGE                 COMMAND                   CREATED          STATUS                    PORTS      NAMES
ccadf94d5f46   dokku/hasura:latest   "/bin/sh -c '\"${HGE_…"   32 minutes ago   Up 32 minutes (healthy)              hasura.web.1
37d9d9879e52   postgres:11.6         "docker-entrypoint.s…"    38 minutes ago   Up 38 minutes             5432/tcp   dokku.postgres.hasura-db
root@magic-auth:~# docker inspect dokku.postgres.hasura-db | jq ".[0].NetworkSettings.Networks.bridge.IPAddress"
"172.17.0.2"
```

Replace `dokku-postgres-hasura-db` with IP address from above

```sh
psql -Atx postgres://postgres:<PG_PASSWORD>@172.17.0.2:5432/hasura_db
```

Finally run `psql` commands to restore database

```sh
cat schema.sql | psql -Atx postgres://postgres:<PG_PASSWORD>@172.17.0.2:5432/hasura_db
cat data.sql | psql -Atx postgres://postgres:<PG_PASSWORD>@172.17.0.2:5432/hasura_db
```

Import Metadata under https://magic-graphql.iamnoah.com/console/settings/metadata-actions

Run scrape players and confirm it's working

> https://dcss.vercel.app/api/scrapePlayers

All good!

Run databse backup action but `data.sql` is empty (`0 bytes`) due to postgres password being outdated now

> https://github.com/magus/mono/actions/workflows/magic.iamnoah.com.yml

Need to update `MAGIC_AUTH_DATABASE_URL` secret in github with output from command above

> https://github.com/magus/mono/settings/secrets/actions

```sh
dokku postgres:info hasura-db
```

## 2023-04-23

Followup, noticed the cron entry is wiped and hasn't been running. Seems related to below

> https://github.com/dokku/dokku-letsencrypt/issues/215

Going to update letsencrypt and rerun cron add.

Had local changes to `cron-job` so I had to `git reset --hard` to run update.

> https://github.com/dokku/dokku-letsencrypt/issues/194

```sh
cd /var/lib/dokku/plugins/enabled/letsencrypt
git reset --hard
dokku plugin:update letsencrypt
dokku report
# letsencrypt 0.20.0
dokku letsencrypt:cron-job --add
```

Also deploy failed due to Sentry auth errors

> https://github.com/orgs/vercel/discussions/583

> https://github.com/getsentry/sentry-javascript/issues/4383

Setup Vercel integration again for dcsseeds and redeployed, successfully

## 2023-04-12

SSL certificate expired on magic-iamnoah.graph

Looked at setup `README.md` for `magic.iamnoah.com`

>

SSH into the box and cat the letsencrypt log file which appears to run but not timestamped

```sh
ssh root@104.236.34.97

❯ cat /var/log/dokku/letsencrypt.log
=====> Auto-renewing all apps...
       hasura still has 15d, 23h, 13s days left before renewal
=====> Finished auto-renewal
=====> Auto-renewing all apps...
       hasura still has 14d, 23h, 13s days left before renewal
=====> Finished auto-renewal
=====> Auto-renewing all apps...
       hasura still has 13d, 23h, 13s days left before renewal
=====> Finished auto-renewal

❯ ls -lsah /var/log/dokku/letsencrypt.log
132K -rw-rw-r-- 1 syslog dokku 127K Feb 27 00:00 /var/log/dokku/letsencrypt.log
```

The file does not appear to have been edited since **Feb 27** which lines up
letsencrypt certificates are **valid for 90 days** and **auto renew at 60 days**.
The log says **13 days** away from rewnew on **Feb 27**, which puts us at roughly **March 12**,
then add 30 more days for 90 days (actual expiration), giving us **April 12**.

> Feb 27 + 13d + 30 ~= Apr 12

So seems like the auto renewal cron job was not running, we manually refresh the certificate
with the commands below, and confirm the auto renew reports 60 days

```sh
❯ dokku letsencrypt hasura
❯ dokku ps:scale hasura web=1
❯ dokku letsencrypt:auto-renew
=====> Auto-renewing all apps...
       hasura still has 59d, 22h, 39m, 17s days left before renewal
=====> Finished auto-renewal
```

So why was the auto renew cron job nto running? Well looking at changelog below on
**2023-02-27** we did some dokku related stuff, such as updating, nuking a lot of our setup
and even rebuilding some apps, it's highly likely we broke the cron job during this.

Setting it up again, confirm it actually runs by setting to 2 minute interval

```sh
❯ dokku letsencrypt:cron-job --add
❯ crontab -e -u dokku
*/2 * * * * /var/lib/dokku/plugins/available/letsencrypt/cron-job
tail /var/log/dokku/letsencrypt.log
```

## 2023-03-29

### using crawl to generate full item list

- we absolutely can build crawl and use it to generate a full item list for a seed
- requires a debug build (profile is debug and smaller than debug)

> crawl-dir/0.28.0/crawl-ref/source/scripts/seed_explorer.lua

```sh
cd crawl-dir/0.28.0/crawl-ref/source
make -j4 profile
make util/fake_pty
time util/fake_pty ./crawl -script seed_explorer.lua -depth all -seed 11144789937400634826 > seed-11144789937400634826.txt 2>&1
```

- running this takes about 7s, it's ... very slow but the most accurate item list possible
- results match exactly the results we parsed via `parseMorgue`
- temple altars are not noted in morgue so seed explorer list does show them

> `src/utils/parseMorgue/__tests__/morgue-Jingleheimer-20220810-034403/__snapshots__/parseMorgue.test.js.snap`

## 2023-03-25

built game locally successfully

aliased python3 and pip3 to python/pip in zsh aliases
ran `make -j4 TILES=y` (build game with 4 parallel jobs with TILES enabled)
ran `make -j4` (build game with 4 parallel jobs in console mode)

console mode builds faster, maybe that's ideal since we don't need TILES for binary

requires data files to run apparently, need to figure that out too
next step: execute binary via endpoint and return stdout is to try
next step: ship the binary with vercel deploy and see if it runs in vercel instance

## 2023-03-18

Cleaning up Ashenzari items in database

```graphql
query FindInvalidAshenzariItems {
  dcsseeds_scrapePlayers_item(
    where: { name: { _iregex: "(Melee|Range|Elem|Alch|Comp|Bglg|Self|Fort|Cun|Evo)(,|})" } }
  ) {
    name
  }
}

mutation DeleteInvalidAshenzariItems {
  delete_dcsseeds_scrapePlayers_item(
    where: { name: { _iregex: "(Melee|Range|Elem|Alch|Comp|Bglg|Self|Fort|Cun|Evo)(,|})" } }
  ) {
    affected_rows
  }
}
```

## 2023-03-16

database backups are not working, the `pg_dump` `curl` returns a 502 status code + error page even after a hard restart

after ssh into the machine noticed terminal felt laggy, fast.com showing slow speeds so many latency related?
tried the commands below and was able to quickly generate a `43MB` `data.sql` so we can manually call `pg_dump` just fine

```sh
❯ dokku config:get hasura HASURA_GRAPHQL_DATABASE_URL
<database_url>
❯ dokku enter hasura
root@459974224faf:/> pg_dump <database_url> --no-owner --no-acl --data-only --schema public -f data.sql
root@459974224faf:/> ls -lsah data.sql
43M -rw-r--r-- 1 root root 43M Mar 17 05:52 data.sql
```

now it's a matter of getting it setup so we can run this `pg_dump` remotely from github actions
one idea is to expose the ports to run `pg_dump` remotely, but maybe we could try ssh and redirect to local machine stdout?

```sh
❯ ssh -T root@104.236.34.97 "dokku run hasura pg_dump postgres://postgres:96b2bda121c09c36d9db62ddf8bad5e3@dokku-postgres-hasura-db:5432/hasura_db --no-owner --no-acl --data-only --schema public" > data.sql
```

works but it's very slow for some reason, but it's a start
worst case scenario we can ssh in, write to file locally (fast) and then upload to aws remotely

in dokku droplet under **Access** clicked **Reset root password** to get root password
to be used to ssh into box from github action

generate a new ssh key for accessing DigitalOcean droplet from github action

```bash
❯ ssh-keygen -t ed25519
Generating public/private ed25519 key pair.
Enter file in which to save the key (/Users/noah/.ssh/id_ed25519): ./magic-auth-github-action
Enter passphrase (empty for no passphrase):
Enter same passphrase again:
Your identification has been saved in ./magic-auth-github-action
Your public key has been saved in ./magic-auth-github-action.pub
❯ cat magic-auth-github-action
```

**Github > Settings > Actions > Secrets**

create **`MAGIC_AUTH_SSH_PRIVATE_KEY`** copying the output from command above
create **`MAGIC_AUTH_SSH_HOST`** secret containing IP of host `104.236.34.97`
create **`MAGIC_AUTH_SSH_USER`** secret containing IP of host `root`
create **`MAGIC_AUTH_DATABASE_URL`** secret containing IP of host `postgres://postgres:P@55w0rd@dokku-postgres-hasura-db:5432/hasura_db`

then adding it to the droplet **"Manually from the Droplet without Password-Based Access"**

https://docs.digitalocean.com/products/droplets/how-to/add-ssh-keys/to-existing-droplet/#manually

```bash
❯ cat magic-auth-github-action.pub
❯ ssh root@104.236.34.97
root@magic-auth:~# mkdir -p ~/.ssh
root@magic-auth:~# vim ~/.ssh/authorized_keys
# paste in public key on new line
# save and quit
```

## 2023-03-11

need to migrate all previous `NULL` level values to zero
`NULL` is ignored for primary key which causes duplicate rows and cannot be sorted properly by `branch_level` table
first, discover all duplicate rows where `NULL` in them

```sql
select id from "public"."dcsseeds_scrapePlayers_item" outer_table
where (
    select count(*) from "public"."dcsseeds_scrapePlayers_item" inner_table
    where (
        inner_table.name = outer_table.name
        AND inner_table."branchName" = outer_table."branchName"
        AND inner_table.seed = outer_table.seed
        AND inner_table.morgue = outer_table.morgue
        AND inner_table."fullVersion" = outer_table."fullVersion"
    )
) > 1
```

then run `DELETE` over the select subquery

```sql
DELETE FROM "public"."dcsseeds_scrapePlayers_item" WHERE id IN (
    select id from "public"."dcsseeds_scrapePlayers_item" outer_table
    where (
        select count(*) from "public"."dcsseeds_scrapePlayers_item" inner_table
        where (
            inner_table.name = outer_table.name
            AND inner_table."branchName" = outer_table."branchName"
            AND inner_table.seed = outer_table.seed
            AND inner_table.morgue = outer_table.morgue
            AND inner_table."fullVersion" = outer_table."fullVersion"
        )
    ) > 1
```

finally, now that duplicates are removed we can update all `NULL` values to `0` with mutation below

```graphql
mutation ConvertLevelNullZero {
  update_dcsseeds_scrapePlayers_item(where: { level: { _is_null: true } }, _set: { level: 0 }) {
    affected_rows
  }
}
```

## 2023-03-01

- setting up foreign keys to control how updates and deletes impact related tables
  trying to setup so deleting seedVersion will delete associated items

  dcsseeds_scrapePlayers_item . branchName → dcsseeds_scrapePlayers_branch . name
  update restrict
  delete restrict

  dcsseeds_scrapePlayers_item . ( version, seed ) → dcsseeds_scrapePlayers_seedVersion . ( version, seed )
  update restrict
  delete cascade

- testing on seed with single item first
  v0.29.0, seed 13228964911619526999 (1 item)
  it worked, the associated item is gone
  going to try it again this time with a seed with more items
  v0.29.0, seed 16830254511677329900 (78 items)

  22131 total items before....
  22053 total items after
  22131 - 22053 = 78

- the foreign keys are working as expected

## 2023-02-28

- syntax error near \$ when creating postgres function
- look at migrations for actual function sql, the version in admin console has whitespace errors

```sql
CREATE OR REPLACE FUNCTION public."dcsseeds_scrapePlayers_item_search_name"(search_name text)
 RETURNS SETOF "dcsseeds_scrapePlayers_item"
 LANGUAGE sql
 STABLE
AS $function$
    SELECT
      DISTINCT ON ("branch_order", "level", "seed", "version")
      "timestamp",
      "name",
```

## 2023-02-27

### 502 error

- `We're sorry, but something went wrong.` seems to be nginx 502 error page
- https://sourcegraph.com/github.com/dokku/dokku/-/blob/plugins/nginx-vhosts/templates/502-error.html?subtree=true
- this answer seems to have some useful steps for debugging next time
- https://www.digitalocean.com/community/questions/why-am-i-getting-a-502-bad-gateway-using-dokku-after-a-few-hours-of-uptime?comment=152511

- immediate fix was to restart the dokku hasura deploy

  ```sh
  ssh root@104.236.34.97
  dokku tags:deploy hasura
  ```

- using a curl cron to restart instance when it enters this 502 state could be useful as health check
- dokku added crons in 0.23 but we are on 0.22, need to update to unblock dokku crons
- after update above the 502 error reappeared so debugged it a bit but didn't find anything useful
- command logs below

  ```sh
  ssh root@104.236.34.97

  dokku-update
  # this took awhile and also updated system
  # 502 error reappeared after update

  # try to debug a bit
  dokku logs hasura
  # shows failing requests, nothing new learned
  dokku ps:report hasura
  dokku ps:inspect hasura
  # shows process is still running

  curl https://magic-graphql.iamnoah.com/v1/graphql
  # success returns a short json error
  # error returns 502 page

  dokku ps:rebuild --all
  # failed to rebuild hasura, going to try deploying with new git:from-image
  dokku git:from-image hasura hasura/graphql-engine
  dokku ps:rebuild --all
  # still failing, so trying to restart
  dokku ps:restart hasura
      -----> Running post-deploy
      panic: runtime error: index out of range [1] with length 1

      goroutine 1 [running]:
      github.com/dokku/dokku/plugins/common.ParseScaleOutput({0xc0000aa400, 0x0, 0xc0000506e0?})
        /go/src/github.com/dokku/dokku/plugins/common/common.go:399 +0x154
      github.com/dokku/dokku/plugins/network.BuildConfig({0x7ffcaf79d231, 0x6})
        /go/src/github.com/dokku/dokku/plugins/network/network.go:55 +0x116
      main.main()
        /go/src/github.com/dokku/dokku/plugins/network/src/triggers/triggers.go:34 +0x534
      !     exit status 2
  # also fails, same error
  # https://serverfault.com/questions/1123094/after-upgrading-dokku-cant-start-applications
  dokku ps:scale hasura web=1
  # instance successfully restarted now and working
  ```

- can we setup a report policy for dokku hasura app to recover from this failure state?
- updating dokku on DigitalOcean droplet with cron health check
- https://dokku.com/docs/advanced-usage/deployment-tasks/
- https://dokku.com/docs/processes/scheduled-cron-tasks/#using-run-for-cron-tasks

  ```sh
  # can we use dokku checks for health monitoring?
  # we could manually invoke them to see if they restart instance
  # https://dokku.com/docs/deployment/zero-downtime-deploys/#check-instructions
  dokku checks:run hasura
  # runs nothing just waits 10s (default)
  # need to create a CHECKS file in app dir
  dokku apps:report hasura
  # discover app dir /home/dokku/hasura
  cd /home/dokku/hasura
  vim CHECKS

      WAIT=5      # wait 5s before starting checks
      TIMEOUT=30  # timeout after 30s
      ATTEMPTS=5  # retry 5 times

      //magic-graphql.iamnoah.com/v1/graphql {{"{"}}"code":"not-found","error":"resource does not exist","path":"$"{{"}"}}

  # run checks again
  dokku checks:run hasura
  # still defaults, might be in wrong location?
  dokku enter hasura
  # had to be added to dockerfile via below
  vim Dockerfile

      FROM hasura/graphql-engine
      ADD CHECKS /

  docker build -t="dokku/hasura/graphql-engine" .
  dokku git:from-image hasura dokku/hasura/graphql-engine
  # edit dockerfile and retry via
  docker build -t="dokku/hasura/graphql-engine" .
  dokku ps:rebuild hasura
  # checks failing due to variables at top
  # removed variables so just the single check line
  # curl now fails after 5 attempts

      =====> Processing deployment checks
      -----> Deploying hasura via the docker-local scheduler...
      -----> Deploying web (count=1)
            Attempting pre-flight checks (web.1)
            CHECKS expected result: http://localhost/v1/graphql => "{"code":"not-found","error":"resource does not exist","path":"$"}" (web.1)
            Attempt 1/5. Waiting for 5 seconds (web.1)
      !     curl: (7) Failed to connect to 172.17.0.4 port 5000: Connection refused
      !     Check attempt 1/5 failed (web.1)
            Attempt 2/5. Waiting for 5 seconds (web.1)
      !     curl: (7) Failed to connect to 172.17.0.4 port 5000: Connection refused
      !     Check attempt 2/5 failed (web.1)
            Attempt 3/5. Waiting for 5 seconds (web.1)
      !     curl: (7) Failed to connect to 172.17.0.4 port 5000: Connection refused
      !     Check attempt 3/5 failed (web.1)
            Attempt 4/5. Waiting for 5 seconds (web.1)
      !     curl: (7) Failed to connect to 172.17.0.4 port 5000: Connection refused
      !     Check attempt 4/5 failed (web.1)
            Attempt 5/5. Waiting for 5 seconds (web.1)
      !     curl: (7) Failed to connect to 172.17.0.4 port 5000: Connection refused
      !     Check attempt 5/5 failed (web.1)
      !     Could not start due to 1 failed checks (web.1)

  # trying app.json instead
  # https://dokku.com/docs/advanced-usage/deployment-tasks/
  vim Dockerfile
  vim app.json
  vim health-check.sh
  chmod +x health-check.sh
  docker build -t="dokku/hasura/graphql-engine" .
  dokku ps:rebuild hasura

  # ok the health-check.sh script runs post deploy
  # going to try to setup cron now
  # https://dokku.com/docs/processes/scheduled-cron-tasks/#using-run-for-cron-tasks
  # ok same as above but with the versions checked into magic.iamnoah.com repo
  dokku cron:list hasura
  dokku cron:report hasura

  # cron is running but no logs so setup vector logging
  dokku logs:vector-start
  dokku logs:set hasura vector-sink "console://?encoding[codec]=json"
  dokku logs:vector-logs --tail
  # confirmed cron is running successfully

  # turns out this is useless because the dokku command
  # is not found inside container, so cannot restart in health-check.sh
  # instead will setup a cron inside host machine
  # https://www.digitalocean.com/community/tutorials/how-to-use-cron-to-automate-tasks-ubuntu-1804
  crontab -e
  # paste in line below
  */5 * * * * /home/dokku/hasura/health-check.sh 5 "https://magic-graphql.iamnoah.com/v1/graphql" '{"code":"not-found","error":"resource does not exist","path":"$"}' > /var/log/cronlog 2>&1

  # tail logs for cron, without stdout from process
  journalctl -u cron.service -f
  # confirmed it's running but need to redirect output
  vim /etc/logrotate.d/cronlog

  # since we are no longer modifying dockerfile we can revert the image back to hasura base
  dokku git:from-image hasura hasura/graphql-engine
  dokku ps:rebuild hasura

  # updating instructions in mono/sites/magic.iamnoah.com/README.md
  ```

### query performance

- unrand query for artifact filters was hitting `10s` vercel timeout
- create `/api/cache_unrand_query` to update `window_size` unrand result lists every `1min`
- now `getStaticProps` can query the `unrand_cache` table which is only `106` rows or JSON blobs, very fast
- still bothers me that `/api/cache_unrand_query` for `30` unrands is taking upward for `4000ms`
- finally created a B-Tree index on items table `dcsseeds_scrapeplayers_item_seedVersion(seed, version)`
- this improved query performance significantly since we are looking for all items grouped by seed version
- the original, `106` unrand query is down to `2000ms` from about `10000ms` (`5x` faster)

## 2023-02-16

- realized the unique constraint was not being enforced whatsoever
- looked into creating a custom function to implement `distinct on` + `order by`
- created `dcsseeds_scrapePlayers_items_version_seed` custom function
- used in `src/pages/ItemsSeedVersion/getStaticProps`
- variable names for functions cannot collide with column names otherwise things fail and prefer column name
- e.g. `WHERE seed = seed` is using the same value as the column so equivalent to `WHERE 1=1` (always true)
- so adjusted parameters `seed` -> `input_seed` and `version` -> `input_version`

## 2023-02-15 item constraints

- `dcsseeds_scrapePlayers_item_name_branchName_level_morgue_seed_f` constraint based on `['fullVersion', 'branchName', 'level', 'morgue', 'seed', 'name']` is too unique
- since we incldue `morgue` it creates duplicate items for players who run the same seed
- instead it should be `['version', 'branchName', 'level', 'seed', 'name']` to uniquely identify an item
- in order to implement this constraint i have to cleanup all rows that break the constraint
- if we try to add the constraint hasura admin shows us an error which tells us which items to delete

```json
{
  "code": "postgres-error",
  "error": "query execution failed",
  "internal": {
    "arguments": [],
    "error": {
      "description": "Key (version, \"branchName\", level, seed, name)=(0.28.0, Dungeon, 9, 10077074884737061911, +0 scale mail of Jipp {Str+2 Dex+3}) is duplicated.",
      "exec_status": "FatalError",
      "hint": null,
      "message": "could not create unique index \"dcsseeds_scrapePlayers_item_version_branchName_level_seed_name_\"",
      "status_code": "23505"
    },
    "prepared": false,
    "statement": "alter table \"public\".\"dcsseeds_scrapePlayers_item\" add constraint \"dcsseeds_scrapePlayers_item_version_branchName_level_seed_name_key\" unique (\"version\", \"branchName\", \"level\", \"seed\", \"name\");"
  },
  "path": "$[1]"
}
```

```json
{
  "code": "postgres-error",
  "error": "query execution failed",
  "internal": {
    "arguments": [],
    "error": {
      "description": "Key (version, \"branchName\", level, seed, name)=(0.28.0, Dungeon, 9, 10077074884737061911, +0 scale mail of Jipp {Str+2 Dex+3}) is duplicated.",
      "exec_status": "FatalError",
      "hint": null,
      "message": "could not create unique index \"dcsseeds_scrapePlayers_item_version_branchName_level_seed_name_\"",
      "status_code": "23505"
    },
    "prepared": false,
    "statement": "alter table \"public\".\"dcsseeds_scrapePlayers_item\" add constraint \"dcsseeds_scrapePlayers_item_version_branchName_level_seed_name_key\" unique (\"version\", \"branchName\", \"level\", \"seed\", \"name\");"
  },
  "path": "$[1]"
}
```

- hopefully there aren't too many, going to manually start deleting
- finding the duplicates via this graphql query

```
76f5eea9-0c15-4914-9336-1de0dd3f77e1
6c54b091-44ff-448f-8b2a-8121c5da6231
```

```graphql
query MyQuery {
  dcsseeds_scrapePlayers_item(
    where: { name: { _ilike: "+3 leather armour \"Kueloi\" {Fly Int-3 Dex+4 SInv}" } }
    order_by: { timestamp: asc }
  ) {
    id
    name
    morgue
    timestamp
    version
    seed
    branchName
    level
  }
}
```

- deleting the duplicates

```graphql
mutation MyMutation {
  delete_dcsseeds_scrapePlayers_item(
    where: {
      id: {
        _in: [
          "6ee59ef3-6dc7-4053-af31-ad3aab3365a0"
          "445d9fcf-1f06-4ca9-a3f4-ae813169e5ea"
          "f4360bde-07d5-47e8-b5ad-42637cbd03bd"
          "641cc76f-d39b-4947-a781-c420f0f5939a"
          "3a72d4fb-df54-4b9d-9b23-41f3b61c8d23"
          "1e0da1d8-5aec-4343-9d6d-9d4448efa262"
          "8178bcc7-e1f2-414a-a460-1af0842010cc"
          "7a92d8df-2c8e-4165-b0e8-ac393ee2e8f5"
          "b5768699-9ba8-4900-a557-54615e515b20"
        ]
      }
    }
  ) {
    affected_rows
  }
}
```

- there were WAY too many so I opted to delete everything with graphql below

```graphql
mutation MyMutation {
  delete_dcsseeds_scrapePlayers_item(where: { morgue: { _ilike: "http%" } }) {
    affected_rows
  }
}
```

- then immediately saved the new constraint, successfully
- will update scraper and then let it repopulate overnight

## 2023-02-05 optimize search performance

- followed documentation for fuzzy text search with hasura

  > https://hasura.io/docs/latest/schema/postgres/custom-functions/#example-fuzzy-match-search-functions

  > https://hasura.io/blog/full-text-search-with-hasura-graphql-api-postgres/

- ran sql below directly, creating index which improved query performance
- query time down to 1s from original 30s (timing out in nextjs static page generation)
- db migrations over in `magus/mono://databases/magic-graphql.iamnoah.com/migrations` are a little funky

  ```sql
  CREATE EXTENSION pg_trgm;

  CREATE INDEX dcsseeds_scrapePlayers_item_name_gin_idx ON "public"."dcsseeds_scrapePlayers_item"
  USING GIN ((name) gin_trgm_ops);
  ```

## 2022-12-23 migrate tables to magic hasura db

- heroku free database is deleted
- recreate all Hasura tables + initial scrape players
- setup `dcsseeds_scrapePlayers` tables in `magic-graphql.iamnoah.com` DB (`magus/mono`)
- updated hasura engine in `magic-auth` droplet

  ```sh
  docker pull hasura/graphql-engine
  docker tag hasura/graphql-engine dokku/hasura
  dokku tags:deploy hasura
  ```

## 2022-08-13 how to update DCSS version

Notes when upgrading from 0.26 to 0.27

- Update versions in `src/utils/Versions.js`
  - (add, remove) any Species and Backgrounds
  - update recommended species/backgrounds lookups
- Add new version to `VERSION_CHOICES` in `src/pages/New/New.js`
- Verify on `/new` route that new version works (errors will throw if recommended things are missing)
- Run `./scripts/getSpells.js` to gather spell list
- Update spell slots in `Slots.rc` in `magus/dcss` .rc file
- Update `src/api/job/scrapePlayers.js` `ALLOWED_VERSIONS` (use `api/pargueMorgue` to determine short `version` value to use here)
- Use delete query at top of `src/api/job/scrapePlayers.js` to reset `scrapePlayers`-related tables
