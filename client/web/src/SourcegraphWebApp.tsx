import 'focus-visible'

import * as React from 'react'

import { ApolloProvider } from '@apollo/client'
import { ShortcutProvider } from '@slimsag/react-shortcuts'
import { createBrowserHistory } from 'history'
import ServerIcon from 'mdi-react/ServerIcon'
import { Route, Router } from 'react-router'
import { ScrollManager } from 'react-scroll-manager'
import { combineLatest, from, Subscription, fromEvent, of, Subject } from 'rxjs'
import { catchError, distinctUntilChanged, map, startWith, switchMap } from 'rxjs/operators'
import * as uuid from 'uuid'

import { asError, isErrorLike } from '@sourcegraph/common'
import { GraphQLClient, HTTPStatusError } from '@sourcegraph/http-client'
import {
    fetchAutoDefinedSearchContexts,
    getUserSearchContextNamespaces,
    SearchContextProps,
    fetchSearchContexts,
    fetchSearchContext,
    fetchSearchContextBySpec,
    createSearchContext,
    updateSearchContext,
    deleteSearchContext,
    isSearchContextSpecAvailable,
    getAvailableSearchContextSpecOrDefault,
    SearchQueryStateStoreProvider,
} from '@sourcegraph/search'
import { getEnabledExtensions } from '@sourcegraph/shared/src/api/client/enabledExtensions'
import { preloadExtensions } from '@sourcegraph/shared/src/api/client/preload'
import { NotificationType } from '@sourcegraph/shared/src/api/extension/extensionHostApi'
import {
    Controller as ExtensionsController,
    createController as createExtensionsController,
} from '@sourcegraph/shared/src/extensions/controller'
import { KeyboardShortcutsProps } from '@sourcegraph/shared/src/keyboardShortcuts/keyboardShortcuts'
import { getModeFromPath } from '@sourcegraph/shared/src/languages'
import { BrandedNotificationItemStyleProps } from '@sourcegraph/shared/src/notifications/NotificationItem'
import { Notifications } from '@sourcegraph/shared/src/notifications/Notifications'
import { PlatformContext } from '@sourcegraph/shared/src/platform/context'
import { FilterType } from '@sourcegraph/shared/src/search/query/filters'
import { filterExists } from '@sourcegraph/shared/src/search/query/validate'
import { aggregateStreamingSearch } from '@sourcegraph/shared/src/search/stream'
import { EMPTY_SETTINGS_CASCADE, SettingsCascadeProps } from '@sourcegraph/shared/src/settings/settings'
import { TemporarySettingsProvider } from '@sourcegraph/shared/src/settings/temporary/TemporarySettingsProvider'
import { TemporarySettingsStorage } from '@sourcegraph/shared/src/settings/temporary/TemporarySettingsStorage'
import {
    // This is the root Tooltip usage
    // eslint-disable-next-line no-restricted-imports
    Tooltip,
    FeedbackText,
    setLinkComponent,
    RouterLink,
    WildcardThemeContext,
    WildcardTheme,
} from '@sourcegraph/wildcard'

import { authenticatedUser, AuthenticatedUser } from './auth'
import { getWebGraphQLClient } from './backend/graphql'
import { BatchChangesProps, isBatchChangesExecutionEnabled } from './batches'
import { CodeIntelligenceProps } from './codeintel'
import { ErrorBoundary } from './components/ErrorBoundary'
import { queryExternalServices } from './components/externalServices/backend'
import { HeroPage } from './components/HeroPage'
import { ExtensionAreaRoute } from './extensions/extension/ExtensionArea'
import { ExtensionAreaHeaderNavItem } from './extensions/extension/ExtensionAreaHeader'
import { ExtensionsAreaRoute } from './extensions/ExtensionsArea'
import { ExtensionsAreaHeaderActionButton } from './extensions/ExtensionsAreaHeader'
import { FeatureFlagName, fetchFeatureFlags, FlagSet } from './featureFlags/featureFlags'
import { OverrideFeatureFlagsAgent } from './featureFlags/OverrideFeatureFlagsAgent'
import { IdeExtensionTracker } from './IdeExtensionTracker'
import { CodeInsightsProps } from './insights/types'
import { Layout, LayoutProps } from './Layout'
import { BlockInput } from './notebooks'
import { createNotebook } from './notebooks/backend'
import { blockToGQLInput } from './notebooks/serialize'
import { OrgAreaRoute } from './org/area/OrgArea'
import { OrgAreaHeaderNavItem } from './org/area/OrgHeader'
import { createPlatformContext } from './platform/context'
import { fetchHighlightedFileLineRanges } from './repo/backend'
import { RepoContainerRoute } from './repo/RepoContainer'
import { RepoHeaderActionButton } from './repo/RepoHeader'
import { RepoRevisionContainerRoute } from './repo/RepoRevisionContainer'
import { RepoSettingsAreaRoute } from './repo/settings/RepoSettingsArea'
import { RepoSettingsSideBarGroup } from './repo/settings/RepoSettingsSidebar'
import { LayoutRouteProps } from './routes'
import { PageRoutes } from './routes.constants'
import { parseSearchURL } from './search'
import { SearchResultsCacheProvider } from './search/results/SearchResultsCacheProvider'
import { SearchStack } from './search/SearchStack'
import { listUserRepositories } from './site-admin/backend'
import { SiteAdminAreaRoute } from './site-admin/SiteAdminArea'
import { SiteAdminSideBarGroups } from './site-admin/SiteAdminSidebar'
import { CodeHostScopeProvider } from './site/CodeHostScopeAlerts/CodeHostScopeProvider'
import {
    setQueryStateFromSettings,
    setQueryStateFromURL,
    setExperimentalFeaturesFromSettings,
    getExperimentalFeatures,
    useNavbarQueryState,
} from './stores'
import { BrowserExtensionTracker } from './tracking/BrowserExtensionTracker'
import { eventLogger } from './tracking/eventLogger'
import { withActivation } from './tracking/withActivation'
import { UserAreaRoute } from './user/area/UserArea'
import { UserAreaHeaderNavItem } from './user/area/UserAreaHeader'
import { UserSettingsAreaRoute } from './user/settings/UserSettingsArea'
import { UserSettingsSidebarItems } from './user/settings/UserSettingsSidebar'
import { UserSessionStores } from './UserSessionStores'
import { globbingEnabledFromSettings } from './util/globbing'
import { observeLocation } from './util/location'
import { siteSubjectNoAdmin, viewerSubjectFromSettings } from './util/settings'

import styles from './SourcegraphWebApp.module.scss'

export interface SourcegraphWebAppProps
    extends CodeIntelligenceProps,
        CodeInsightsProps,
        Pick<BatchChangesProps, 'batchChangesEnabled'>,
        Pick<SearchContextProps, 'searchContextsEnabled'>,
        KeyboardShortcutsProps {
    extensionAreaRoutes: readonly ExtensionAreaRoute[]
    extensionAreaHeaderNavItems: readonly ExtensionAreaHeaderNavItem[]
    extensionsAreaRoutes: readonly ExtensionsAreaRoute[]
    extensionsAreaHeaderActionButtons: readonly ExtensionsAreaHeaderActionButton[]
    siteAdminAreaRoutes: readonly SiteAdminAreaRoute[]
    siteAdminSideBarGroups: SiteAdminSideBarGroups
    siteAdminOverviewComponents: readonly React.ComponentType[]
    userAreaHeaderNavItems: readonly UserAreaHeaderNavItem[]
    userAreaRoutes: readonly UserAreaRoute[]
    userSettingsSideBarItems: UserSettingsSidebarItems
    userSettingsAreaRoutes: readonly UserSettingsAreaRoute[]
    orgAreaHeaderNavItems: readonly OrgAreaHeaderNavItem[]
    orgAreaRoutes: readonly OrgAreaRoute[]
    repoContainerRoutes: readonly RepoContainerRoute[]
    repoRevisionContainerRoutes: readonly RepoRevisionContainerRoute[]
    repoHeaderActionButtons: readonly RepoHeaderActionButton[]
    repoSettingsAreaRoutes: readonly RepoSettingsAreaRoute[]
    repoSettingsSidebarGroups: readonly RepoSettingsSideBarGroup[]
    routes: readonly LayoutRouteProps<any>[]
}

interface SourcegraphWebAppState extends SettingsCascadeProps {
    error?: Error

    /**
     * The currently authenticated user:
     * - `undefined` until `CurrentAuthState` query completion.
     * - `AuthenticatedUser` if the viewer is authenticated.
     * - `null` if the viewer is anonymous.
     */
    authenticatedUser?: AuthenticatedUser | null

    /** GraphQL client initialized asynchronously to restore persisted cache. */
    graphqlClient?: GraphQLClient

    temporarySettingsStorage?: TemporarySettingsStorage

    viewerSubject: LayoutProps['viewerSubject']

    selectedSearchContextSpec?: string
    defaultSearchContextSpec: string
    hasUserAddedRepositories: boolean
    hasUserSyncedPublicRepositories: boolean
    hasUserAddedExternalServices: boolean

    /**
     * Whether globbing is enabled for filters.
     */
    globbing: boolean

    /**
     * Evaluated feature flags for the current viewer
     */
    featureFlags: FlagSet
}

const notificationStyles: BrandedNotificationItemStyleProps = {
    notificationItemVariants: {
        [NotificationType.Log]: 'secondary',
        [NotificationType.Success]: 'success',
        [NotificationType.Info]: 'info',
        [NotificationType.Warning]: 'warning',
        [NotificationType.Error]: 'danger',
    },
}

const LAST_SEARCH_CONTEXT_KEY = 'sg-last-search-context'
const WILDCARD_THEME: WildcardTheme = {
    isBranded: true,
}

setLinkComponent(RouterLink)

const LayoutWithActivation = window.context.sourcegraphDotComMode ? Layout : withActivation(Layout)

const history = createBrowserHistory()

/**
 * The root component.
 */
export class SourcegraphWebApp extends React.Component<SourcegraphWebAppProps, SourcegraphWebAppState> {
    private readonly subscriptions = new Subscription()
    private readonly userRepositoriesUpdates = new Subject<void>()
    private readonly platformContext: PlatformContext = createPlatformContext()
    private readonly extensionsController: ExtensionsController = createExtensionsController(this.platformContext)

    constructor(props: SourcegraphWebAppProps) {
        super(props)
        this.subscriptions.add(this.extensionsController)

        // Preload extensions whenever user enabled extensions or the viewed language changes.
        this.subscriptions.add(
            combineLatest([
                getEnabledExtensions(this.platformContext),
                observeLocation(history).pipe(
                    startWith(location),
                    map(location => getModeFromPath(location.pathname)),
                    distinctUntilChanged()
                ),
            ]).subscribe(([extensions, languageID]) => {
                preloadExtensions({
                    extensions,
                    languages: new Set([languageID]),
                })
            })
        )

        setQueryStateFromURL(window.location.search)

        this.state = {
            settingsCascade: EMPTY_SETTINGS_CASCADE,
            viewerSubject: siteSubjectNoAdmin(),
            defaultSearchContextSpec: 'global', // global is default for now, user will be able to change this at some point
            hasUserAddedRepositories: false,
            hasUserSyncedPublicRepositories: false,
            hasUserAddedExternalServices: false,
            globbing: false,
            featureFlags: new Map<FeatureFlagName, boolean>(),
        }
    }

    public componentDidMount(): void {
        const parsedSearchURL = parseSearchURL(window.location.search)
        const parsedSearchQuery = parsedSearchURL.query || ''

        document.documentElement.classList.add('theme')

        getWebGraphQLClient()
            .then(graphqlClient => {
                this.setState({
                    graphqlClient,
                    temporarySettingsStorage: new TemporarySettingsStorage(
                        graphqlClient,
                        window.context.isAuthenticatedUser
                    ),
                })
            })
            .catch(error => {
                console.error('Error initializing GraphQL client', error)
            })

        this.subscriptions.add(
            combineLatest([
                from(this.platformContext.settings),
                // Start with `undefined` while we don't know if the viewer is authenticated or not.
                authenticatedUser.pipe(startWith(undefined)),
            ]).subscribe(
                ([settingsCascade, authenticatedUser]) => {
                    setExperimentalFeaturesFromSettings(settingsCascade)
                    setQueryStateFromSettings(settingsCascade)
                    this.setState({
                        settingsCascade,
                        authenticatedUser,
                        globbing: globbingEnabledFromSettings(settingsCascade),
                        viewerSubject: viewerSubjectFromSettings(settingsCascade, authenticatedUser),
                    })
                },
                () => this.setState({ authenticatedUser: null })
            )
        )

        this.subscriptions.add(
            combineLatest([this.userRepositoriesUpdates, authenticatedUser])
                .pipe(
                    switchMap(([, authenticatedUser]) =>
                        authenticatedUser
                            ? combineLatest([
                                  listUserRepositories({
                                      id: authenticatedUser.id,
                                      first: window.context.sourcegraphDotComMode ? undefined : 1,
                                  }),
                                  queryExternalServices({ namespace: authenticatedUser.id, first: 1, after: null }),
                                  [authenticatedUser],
                              ])
                            : of(null)
                    ),
                    catchError(error => [asError(error)])
                )
                .subscribe(result => {
                    if (!isErrorLike(result) && result !== null) {
                        const [userRepositoriesResult, externalServicesResult] = result

                        this.setState({
                            hasUserAddedRepositories: userRepositoriesResult.nodes.length > 0,
                            hasUserAddedExternalServices: externalServicesResult.nodes.length > 0,
                        })
                    }
                })
        )

        /**
         * Listens for uncaught 401 errors when a user when a user was previously authenticated.
         *
         * Don't subscribe to this event when there wasn't an authenticated user,
         * as it could lead to an infinite loop of 401 -> reload -> 401
         */
        this.subscriptions.add(
            authenticatedUser
                .pipe(
                    switchMap(authenticatedUser =>
                        authenticatedUser ? fromEvent<ErrorEvent>(window, 'error') : of(null)
                    )
                )
                .subscribe(event => {
                    if (event?.error instanceof HTTPStatusError && event.error.status === 401) {
                        location.reload()
                    }
                })
        )

        this.subscriptions.add(
            fetchFeatureFlags().subscribe(event => {
                // Disabling linter here because this is not yet used anywhere.
                // This can be re-enabled as soon as feature flags are leveraged.
                // eslint-disable-next-line react/no-unused-state
                this.setState({ featureFlags: event })
            })
        )

        if (parsedSearchQuery && !filterExists(parsedSearchQuery, FilterType.context)) {
            // If a context filter does not exist in the query, we have to switch the selected context
            // to global to match the UI with the backend semantics (if no context is specified in the query,
            // the query is run in global context).
            this.setSelectedSearchContextSpec('global')
        }
        if (!parsedSearchQuery) {
            // If no query is present (e.g. search page, settings page), select the last saved
            // search context from localStorage as currently selected search context.
            const lastSelectedSearchContextSpec = localStorage.getItem(LAST_SEARCH_CONTEXT_KEY) || 'global'
            this.setSelectedSearchContextSpec(lastSelectedSearchContextSpec)
        }

        this.setWorkspaceSearchContext(this.state.selectedSearchContextSpec).catch(error => {
            console.error('Error sending search context to extensions!', error)
        })

        this.userRepositoriesUpdates.next()
    }

    public componentWillUnmount(): void {
        this.subscriptions.unsubscribe()
    }

    public render(): React.ReactFragment | null {
        if (window.pageError && window.pageError.statusCode !== 404) {
            const statusCode = window.pageError.statusCode
            const statusText = window.pageError.statusText
            const errorMessage = window.pageError.error
            const errorID = window.pageError.errorID

            let subtitle: JSX.Element | undefined
            if (errorID) {
                subtitle = <FeedbackText headerText="Sorry, there's been a problem." />
            }
            if (errorMessage) {
                subtitle = (
                    <div className={styles.error}>
                        {subtitle}
                        {subtitle && <hr className="my-3" />}
                        <pre>{errorMessage}</pre>
                    </div>
                )
            } else {
                subtitle = <div className={styles.error}>{subtitle}</div>
            }
            return <HeroPage icon={ServerIcon} title={`${statusCode}: ${statusText}`} subtitle={subtitle} />
        }

        const { authenticatedUser, graphqlClient, temporarySettingsStorage } = this.state
        if (authenticatedUser === undefined || graphqlClient === undefined || temporarySettingsStorage === undefined) {
            return null
        }

        const { children, ...props } = this.props

        return (
            <ApolloProvider client={graphqlClient}>
                <ErrorBoundary location={null}>
                    <ShortcutProvider>
                        <WildcardThemeContext.Provider value={WILDCARD_THEME}>
                            <TemporarySettingsProvider temporarySettingsStorage={temporarySettingsStorage}>
                                <SearchResultsCacheProvider>
                                    <SearchQueryStateStoreProvider useSearchQueryState={useNavbarQueryState}>
                                        <ScrollManager history={history}>
                                            <Router history={history} key={0}>
                                                <OverrideFeatureFlagsAgent />
                                                <Route
                                                    path="/"
                                                    render={routeComponentProps => (
                                                        <CodeHostScopeProvider authenticatedUser={authenticatedUser}>
                                                            <LayoutWithActivation
                                                                {...props}
                                                                {...routeComponentProps}
                                                                authenticatedUser={authenticatedUser}
                                                                viewerSubject={this.state.viewerSubject}
                                                                settingsCascade={this.state.settingsCascade}
                                                                batchChangesEnabled={this.props.batchChangesEnabled}
                                                                batchChangesExecutionEnabled={isBatchChangesExecutionEnabled(
                                                                    this.state.settingsCascade
                                                                )}
                                                                batchChangesWebhookLogsEnabled={
                                                                    window.context.batchChangesWebhookLogsEnabled
                                                                }
                                                                // Search query
                                                                fetchHighlightedFileLineRanges={
                                                                    fetchHighlightedFileLineRanges
                                                                }
                                                                // Extensions
                                                                platformContext={this.platformContext}
                                                                extensionsController={this.extensionsController}
                                                                telemetryService={eventLogger}
                                                                isSourcegraphDotCom={
                                                                    window.context.sourcegraphDotComMode
                                                                }
                                                                searchContextsEnabled={this.props.searchContextsEnabled}
                                                                hasUserAddedRepositories={this.hasUserAddedRepositories()}
                                                                hasUserAddedExternalServices={
                                                                    this.state.hasUserAddedExternalServices
                                                                }
                                                                selectedSearchContextSpec={this.getSelectedSearchContextSpec()}
                                                                setSelectedSearchContextSpec={
                                                                    this.setSelectedSearchContextSpec
                                                                }
                                                                getUserSearchContextNamespaces={
                                                                    getUserSearchContextNamespaces
                                                                }
                                                                fetchAutoDefinedSearchContexts={
                                                                    fetchAutoDefinedSearchContexts
                                                                }
                                                                fetchSearchContexts={fetchSearchContexts}
                                                                fetchSearchContextBySpec={fetchSearchContextBySpec}
                                                                fetchSearchContext={fetchSearchContext}
                                                                createSearchContext={createSearchContext}
                                                                updateSearchContext={updateSearchContext}
                                                                deleteSearchContext={deleteSearchContext}
                                                                isSearchContextSpecAvailable={
                                                                    isSearchContextSpecAvailable
                                                                }
                                                                defaultSearchContextSpec={
                                                                    this.state.defaultSearchContextSpec
                                                                }
                                                                globbing={this.state.globbing}
                                                                streamSearch={aggregateStreamingSearch}
                                                                onUserExternalServicesOrRepositoriesUpdate={
                                                                    this.onUserExternalServicesOrRepositoriesUpdate
                                                                }
                                                                onSyncedPublicRepositoriesUpdate={
                                                                    this.onSyncedPublicRepositoriesUpdate
                                                                }
                                                                featureFlags={this.state.featureFlags}
                                                            />
                                                        </CodeHostScopeProvider>
                                                    )}
                                                />
                                                <SearchStack onCreateNotebook={this.onCreateNotebook} />
                                                <IdeExtensionTracker />
                                                <BrowserExtensionTracker />
                                            </Router>
                                        </ScrollManager>
                                        <Tooltip key={1} />
                                        <Notifications
                                            key={2}
                                            extensionsController={this.extensionsController}
                                            notificationItemStyleProps={notificationStyles}
                                        />
                                        <UserSessionStores />
                                    </SearchQueryStateStoreProvider>
                                </SearchResultsCacheProvider>
                            </TemporarySettingsProvider>
                        </WildcardThemeContext.Provider>
                    </ShortcutProvider>
                </ErrorBoundary>
            </ApolloProvider>
        )
    }

    private onUserExternalServicesOrRepositoriesUpdate = (
        externalServicesCount: number,
        userRepoCount: number
    ): void => {
        this.setState({
            hasUserAddedExternalServices: externalServicesCount > 0,
            hasUserAddedRepositories: userRepoCount > 0,
        })
    }

    private onSyncedPublicRepositoriesUpdate = (publicReposCount: number): void => {
        this.setState({
            hasUserSyncedPublicRepositories: publicReposCount > 0,
        })
    }

    private hasUserAddedRepositories = (): boolean =>
        this.state.hasUserAddedRepositories || this.state.hasUserSyncedPublicRepositories

    private getSelectedSearchContextSpec = (): string | undefined =>
        getExperimentalFeatures().showSearchContext ? this.state.selectedSearchContextSpec : undefined

    private setSelectedSearchContextSpec = (spec: string): void => {
        if (!this.props.searchContextsEnabled) {
            return
        }

        const { defaultSearchContextSpec } = this.state
        this.subscriptions.add(
            getAvailableSearchContextSpecOrDefault({
                spec,
                defaultSpec: defaultSearchContextSpec,
                platformContext: this.platformContext,
            }).subscribe(availableSearchContextSpecOrDefault => {
                this.setState({ selectedSearchContextSpec: availableSearchContextSpecOrDefault })
                localStorage.setItem(LAST_SEARCH_CONTEXT_KEY, availableSearchContextSpecOrDefault)

                this.setWorkspaceSearchContext(availableSearchContextSpecOrDefault).catch(error => {
                    console.error('Error sending search context to extensions', error)
                })
            })
        )
    }

    private async setWorkspaceSearchContext(spec: string | undefined): Promise<void> {
        const extensionHostAPI = await this.extensionsController.extHostAPI
        await extensionHostAPI.setSearchContext(spec)
    }

    private onCreateNotebook = (blocks: BlockInput[]): void => {
        if (!this.state.authenticatedUser) {
            return
        }

        this.subscriptions.add(
            createNotebook({
                notebook: {
                    title: 'New Notebook',
                    blocks: blocks.map(block => blockToGQLInput({ id: uuid.v4(), ...block })),
                    public: false,
                    namespace: this.state.authenticatedUser.id,
                },
            }).subscribe(createdNotebook => {
                history.push(PageRoutes.Notebook.replace(':id', createdNotebook.id))
            })
        )
    }
}
