import React, { FunctionComponent, useCallback, useEffect, useMemo, useState } from 'react'

import { gql, useMutation } from '@apollo/client'
import classNames from 'classnames'
import DeleteIcon from 'mdi-react/DeleteIcon'
import { RouteComponentProps, useHistory } from 'react-router'
import { of } from 'rxjs'
import { catchError, map } from 'rxjs/operators'

import { ErrorAlert } from '@sourcegraph/branded/src/components/alerts'
import { Form } from '@sourcegraph/branded/src/components/Form'
import { Toggle } from '@sourcegraph/branded/src/components/Toggle'
import { asError, ErrorLike, isErrorLike, pluralize } from '@sourcegraph/common'
import { TelemetryProps } from '@sourcegraph/shared/src/telemetry/telemetryService'
import {
    Button,
    Container,
    Link,
    LoadingSpinner,
    PageHeader,
    Select,
    useObservable,
    Icon,
    Modal,
    Input,
    Label,
} from '@sourcegraph/wildcard'

import { Collapsible } from '../components/Collapsible'
import { LoaderButton } from '../components/LoaderButton'
import { PageTitle } from '../components/PageTitle'
import { RadioButtons } from '../components/RadioButtons'

import { fetchFeatureFlags as defaultFetchFeatureFlags } from './backend'
import { getFeatureFlagReferences, parseProductReference } from './SiteAdminFeatureFlagsPage'

import styles from './SiteAdminFeatureFlagConfigurationPage.module.scss'

export interface SiteAdminFeatureFlagConfigurationProps extends RouteComponentProps<{ name: string }>, TelemetryProps {
    fetchFeatureFlags?: typeof defaultFetchFeatureFlags
    productVersion?: string
}

export const SiteAdminFeatureFlagConfigurationPage: FunctionComponent<SiteAdminFeatureFlagConfigurationProps> = ({
    match: { params },
    fetchFeatureFlags = defaultFetchFeatureFlags,
    productVersion = window.context.version,
}) => {
    const history = useHistory()
    const productGitVersion = parseProductReference(productVersion)
    const isCreateFeatureFlag = params.name === 'new'

    // Load the initial feature flag, unless we are creating a new feature flag.
    const featureFlagOrError = useObservable(
        useMemo(
            () =>
                isCreateFeatureFlag
                    ? of(undefined)
                    : fetchFeatureFlags().pipe(
                          map(flags => flags.find(flag => flag.name === params.name)),
                          map(flag => {
                              if (flag === undefined) {
                                  throw new Error(`Could not find feature flag with name '${params.name}'.`)
                              }
                              return flag
                          }),
                          catchError((error): [ErrorLike] => [asError(error)])
                      ),
            [isCreateFeatureFlag, params.name, fetchFeatureFlags]
        )
    )

    // Split feature flag fields into parts that can be individually updated during
    // feature flag creation or management of an existing feature flag.
    const [flagName, setFlagName] = useState<string>()
    const [flagType, setFlagType] = useState<FeatureFlagType>()
    const [flagValue, setFlagValue] = useState<FeatureFlagValue>()
    const [flagOverrides, setOverrides] = useState<FeatureFlagOverride[]>()
    useEffect(() => {
        if (featureFlagOrError && !isErrorLike(featureFlagOrError)) {
            setFlagName(featureFlagOrError.name)
            setFlagType(featureFlagOrError.__typename)
            setFlagValue(featureFlagOrError)
            setOverrides(featureFlagOrError.overrides)
        }
    }, [featureFlagOrError])

    const onOverridesUpdate = useCallback(
        (overrides: FeatureFlagOverride[]) => {
            setOverrides(overrides)
        },
        [setOverrides]
    )

    // Set up mutations for creation or management of this feature flag.
    const [createFeatureFlag, { loading: createFlagLoading, error: createFlagError }] = useMutation(
        CREATE_FEATURE_FLAG_MUTATION
    )
    const [updateFeatureFlag, { loading: updateFlagLoading, error: updateFlagError }] = useMutation(
        UPDATE_FEATURE_FLAG_MUTATION
    )
    const [deleteFeatureFlag, { loading: deleteFlagLoading, error: deleteFlagError }] = useMutation(
        DELETE_FEATURE_FLAG_MUTATION
    )

    // Create the main form fields and action buttons based on the state of the page.
    let body: React.ReactElement
    let actions: React.ReactElement | undefined
    if (isCreateFeatureFlag) {
        // Create new feature flag state
        body = (
            <CreateFeatureFlag
                name={flagName}
                type={flagType}
                value={flagValue}
                setFlagName={setFlagName}
                setFlagType={setFlagType}
                setFlagValue={setFlagValue}
            />
        )
        actions = (
            <Button
                variant="primary"
                disabled={!flagName || !flagType || createFlagLoading}
                onClick={() =>
                    createFeatureFlag({
                        variables: {
                            name: flagName,
                            ...flagValue,
                        },
                    }).then(() => {
                        history.push(`./${flagName || 'new'}`)
                    })
                }
            >
                {createFlagLoading ? (
                    <>
                        <LoadingSpinner /> Creating...
                    </>
                ) : (
                    'Create flag'
                )}
            </Button>
        )
    } else if (isErrorLike(featureFlagOrError)) {
        // Error occured state
        body = <ErrorAlert prefix="Error fetching feature flag" error={featureFlagOrError} />
    } else if (flagName && flagType && flagValue) {
        // Found existing feature flag state
        body = (
            <ManageFeatureFlag
                name={flagName}
                type={flagType}
                value={flagValue}
                overrides={flagOverrides}
                onOverridesUpdate={onOverridesUpdate}
                setFlagValue={setFlagValue}
            />
        )
        actions = (
            <>
                <Button
                    variant="primary"
                    disabled={updateFlagLoading || deleteFlagLoading}
                    onClick={() =>
                        updateFeatureFlag({
                            variables: {
                                name: flagName,
                                ...flagValue,
                            },
                        }).then(() => {
                            history.push(`./${flagName}`)
                        })
                    }
                >
                    {updateFlagLoading ? (
                        <>
                            <LoadingSpinner /> Updating...
                        </>
                    ) : (
                        'Update'
                    )}
                </Button>
                <Button
                    variant="danger"
                    outline={true}
                    className="float-right"
                    disabled={updateFlagLoading || deleteFlagLoading}
                    onClick={() =>
                        deleteFeatureFlag({
                            variables: {
                                name: flagName,
                            },
                        }).then(() => {
                            history.push('../')
                        })
                    }
                >
                    {deleteFlagLoading ? (
                        <>
                            <LoadingSpinner /> Deleting...
                        </>
                    ) : (
                        <>
                            <Icon as={DeleteIcon} /> Delete
                        </>
                    )}
                </Button>
            </>
        )
    } else {
        body = <LoadingSpinner className="mt-2" />
    }

    const verb = isCreateFeatureFlag ? 'Create' : 'Manage'
    return (
        <>
            <PageTitle title={`${verb} feature flag`} />
            <PageHeader
                headingElement="h2"
                path={[
                    {
                        text: <>{verb} feature flag</>,
                    },
                ]}
                className="mb-3"
            />

            {createFlagError && <ErrorAlert prefix="Error creating feature flag" error={createFlagError} />}
            {updateFlagError && <ErrorAlert prefix="Error updating feature flag" error={updateFlagError} />}
            {deleteFlagError && <ErrorAlert prefix="Error deleting feature flag" error={deleteFlagError} />}

            <Container>
                {body}

                <ReferencesCollapsible flagName={flagName} productGitVersion={productGitVersion} />
            </Container>

            <div className="mt-3">
                {actions}
                <Button type="button" className="ml-2" variant="secondary" onClick={() => history.push('../')}>
                    Cancel
                </Button>
            </div>
        </>
    )
}

type FeatureFlagType = 'FeatureFlagBoolean' | 'FeatureFlagRollout'

interface FeatureFlagOverride {
    id: string
    value: boolean
}

interface FeaturefFlagOverrideParsedID {
    OrgID: number
    UserID: number
    FlagName: string
}

interface FeatureFlagBooleanValue {
    value: boolean
}

interface FeatureFlagRolloutValue {
    rolloutBasisPoints: number
}

interface CreateFeatureFlagOverrideResult {
    createFeatureFlagOverride: FeatureFlagOverride
}
interface CreateFeatureFlagOverrideVariables {
    namespace: string
    flagName: string
    value: boolean
}

type FeatureFlagValue = FeatureFlagBooleanValue | FeatureFlagRolloutValue
type FeatureFlagOverrideType = 'User' | 'Org'

const AddFeatureFlagOverride: FunctionComponent<{
    name: string
    value: boolean
    onOverrideAdded: (override: FeatureFlagOverride) => void
}> = ({ name, value, onOverrideAdded }) => {
    const [showAddOverride, setShowAddOverride] = useState<boolean>(false)
    const [overrideValue, setOverrideValue] = useState<boolean>(!value)
    const [overrideType, setOverrideType] = useState<FeatureFlagOverrideType>('User')
    const [namespaceID, setNamespaceID] = useState<number | string>('')

    const getBase64Namespace = useCallback((): string => btoa(`${overrideType}:${namespaceID}`), [
        namespaceID,
        overrideType,
    ])

    const [addOverride, { loading, error, reset }] = useMutation<
        CreateFeatureFlagOverrideResult,
        CreateFeatureFlagOverrideVariables
    >(CREATE_FEATURE_FLAG_OVERRIDE_MUTATION, {
        variables: {
            namespace: getBase64Namespace(),
            flagName: name,
            value: overrideValue,
        },
        onCompleted: data => {
            onOverrideAdded(data.createFeatureFlagOverride)
            closeModal()
        },
    })

    const closeModal = useCallback(() => {
        setShowAddOverride(false)
        setOverrideType('User')
        setNamespaceID('')
        setOverrideValue(!value)
        reset()
    }, [setShowAddOverride, setOverrideType, setNamespaceID, setOverrideValue, value, reset])

    const openModal = useCallback(
        (event: React.MouseEvent<HTMLButtonElement>) => {
            event.stopPropagation()
            setShowAddOverride(true)
        },
        [setShowAddOverride]
    )

    const setInputValue = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            const stringValue = event.target.value.trim()
            if (stringValue !== '') {
                setNamespaceID(Number(stringValue))
            } else {
                setNamespaceID('')
            }
        },
        [setNamespaceID]
    )

    return (
        <div>
            <Modal isOpen={showAddOverride} onDismiss={closeModal} aria-label="Add Feature Flag Override Modal">
                <h3>Add feature flag override for {name}</h3>
                <Form>
                    <Label className="w-100 mt-4">
                        Override type
                        <RadioButtons
                            nodes={[
                                {
                                    id: 'User',
                                    label: 'User',
                                },
                                {
                                    id: 'Org',
                                    label: 'Organization',
                                },
                            ]}
                            name="toggle-retention"
                            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                                setOverrideType(event.target.value as FeatureFlagOverrideType)
                            }
                            selected={overrideType}
                        />
                    </Label>
                    <Input
                        className="mt-2"
                        label={`${overrideType} ID`}
                        type="number"
                        value={namespaceID}
                        onChange={setInputValue}
                    />
                    <Label className="w-100">
                        <div className="mb-2 mt-2">Value</div>
                        <Toggle
                            title="Value"
                            value={overrideValue}
                            disabled={false}
                            onToggle={() => setOverrideValue(!overrideValue)}
                            aria-describedby="add-feature-flag-override-value-toggle-description"
                        />
                        <span className="ml-1 text-capitalize">{Boolean(overrideValue).toString()}</span>
                    </Label>
                    {error && <ErrorAlert prefix="Error adding override" error={error} />}
                    <div className="d-flex justify-content-end">
                        <Button onClick={closeModal} variant="secondary" className="mr-2">
                            Cancel
                        </Button>
                        <LoaderButton
                            type="submit"
                            variant="primary"
                            disabled={loading || namespaceID === ''}
                            onClick={() => addOverride()}
                            label="Add override"
                            loading={loading}
                        />
                    </div>
                </Form>
            </Modal>
            <Button variant="primary" size="sm" className="mt-1 mb-2" onClick={openModal}>
                Add override
            </Button>
        </div>
    )
}

const FeatureFlagOverridesHeader: FunctionComponent<{
    name: string
    type: FeatureFlagType
    value: FeatureFlagValue
    overrides: FeatureFlagOverride[]
    onOverrideAdded: (flag: FeatureFlagOverride) => void
}> = ({ name, type, value, overrides, onOverrideAdded }) => {
    const count = `${overrides.length} override${overrides.length === 1 ? '' : 's'}`

    return (
        <>
            {type === 'FeatureFlagBoolean' && (
                <AddFeatureFlagOverride
                    name={name}
                    value={(value as FeatureFlagBooleanValue).value}
                    onOverrideAdded={onOverrideAdded}
                />
            )}
            <div className="mr-auto">{count}</div>
        </>
    )
}

interface UpdateFeatureFlagOverrideResult {
    updateFeatureFlagOverride: FeatureFlagOverride
}

const FeatureFlagOverrideItem: FunctionComponent<{
    override: FeatureFlagOverride
    onUpdate: (value: boolean) => void
    onDelete: () => void
}> = ({ override, onUpdate, onDelete }) => {
    const { id, value } = override

    const [error, setError] = useState<Error>()

    const { OrgID: orgID, UserID: userID } = JSON.parse(
        atob(id).replace('FeatureFlagOverride:{', '{')
    ) as FeaturefFlagOverrideParsedID
    const nsLabel = orgID > 0 ? 'OrgID' : 'UserID'
    const nsValue = orgID > 0 ? orgID : userID

    const onError = useCallback(
        error => {
            setError(error)
        },
        [setError]
    )

    const [deleteFeatureFlagOverride, { loading: deleteOverrideLoading }] = useMutation(
        DELETE_FEATURE_FLAG_OVERRIDE_MUTATION,
        {
            variables: { id },
            onCompleted: () => {
                onDelete()
                setError(undefined)
            },
            onError,
        }
    )

    const [updateFeatureFlagOverride, { loading: updateOverrideLoading }] = useMutation<
        UpdateFeatureFlagOverrideResult,
        FeatureFlagOverride
    >(UPDATE_FEATURE_FLAG_OVERRIDE_MUTATION, {
        variables: {
            id,
            value: !value,
        },
        onCompleted: data => {
            onUpdate(data.updateFeatureFlagOverride.value)
            setError(undefined)
        },
        onError,
    })

    return (
        <li className="d-flex align-items-center p-2">
            {updateOverrideLoading && <LoadingSpinner />}
            {error && <ErrorAlert prefix="Error modifying override" error={error} />}
            <Toggle
                title="Value"
                value={value}
                disabled={updateOverrideLoading}
                onToggle={() => updateFeatureFlagOverride()}
                className="mr-1"
                aria-describedby="feature-flag-override-toggle-description"
            />
            <span className="text-capitalize">{Boolean(value).toString()}</span>
            {/*
                TODO: querying for namespace of orgId does not work on Cloud,
                so just present the decoded contents of the ID for now.
                https://github.com/sourcegraph/sourcegraph/issues/32238
            */}
            <strong className="ml-4">{nsLabel}:</strong>
            <span className="pl-1 mr-auto">{nsValue}</span>
            <LoaderButton
                variant="danger"
                outline={true}
                className="align-self-end"
                size="sm"
                onClick={() => deleteFeatureFlagOverride()}
                label="Delete Override"
                loading={deleteOverrideLoading}
                alwaysShowLabel={true}
            />
        </li>
    )
}

/**
 * Component with form fields for managing an existing feature flag.
 */
const ManageFeatureFlag: FunctionComponent<{
    name: string
    type: FeatureFlagType
    value: FeatureFlagValue
    overrides?: FeatureFlagOverride[]
    onOverridesUpdate: (overrides: FeatureFlagOverride[]) => void
    setFlagValue: (flag: FeatureFlagValue) => void
}> = ({ name, type, value, overrides, onOverridesUpdate, setFlagValue }) => {
    const addOverride = useCallback(
        (override: FeatureFlagOverride): void => {
            const newOverrides = overrides?.slice() || []
            newOverrides.push(override)
            onOverridesUpdate(newOverrides)
        },
        [overrides, onOverridesUpdate]
    )

    const updateOverride = useCallback(
        (index: number, value: boolean): void => {
            if ((overrides?.length || -1) > index) {
                const newOverrides = overrides?.slice() || []
                newOverrides[index].value = value
                onOverridesUpdate(newOverrides)
            }
        },
        [overrides, onOverridesUpdate]
    )

    const deleteOverride = useCallback(
        (index: number): void => {
            if ((overrides?.length || -1) > index) {
                const newOverrides = overrides?.slice() || []
                newOverrides?.splice(index, 1)
                onOverridesUpdate(newOverrides)
            }
        },
        [overrides, onOverridesUpdate]
    )

    return (
        <>
            <h3>Name</h3>
            <p>{name}</p>

            <h3>Type</h3>
            <p>{type.slice('FeatureFlag'.length)}</p>

            <FeatureFlagValueSettings type={type} value={value} setFlagValue={setFlagValue} />

            <Collapsible
                title={<h3>Overrides</h3>}
                detail={
                    <FeatureFlagOverridesHeader
                        overrides={overrides || []}
                        name={name}
                        type={type}
                        value={value}
                        onOverrideAdded={addOverride}
                    />
                }
                className="p-0 font-weight-normal"
                buttonClassName="mb-0"
                titleAtStart={true}
                defaultExpanded={false}
                wholeTitleClickable={false}
            >
                <Container className={classNames('mb-2 mt-2', styles.featureFlagOverrideList)}>
                    <ul>
                        {overrides?.map((override, index) => (
                            <FeatureFlagOverrideItem
                                key={override.id}
                                override={override}
                                onUpdate={(newValue: boolean) => updateOverride(index, newValue)}
                                onDelete={() => deleteOverride(index)}
                            />
                        ))}
                    </ul>
                </Container>
            </Collapsible>
        </>
    )
}

/**
 * Component with form fields for creating a feature flag.
 */
const CreateFeatureFlag: React.FunctionComponent<{
    name?: string
    setFlagName: (s: string) => void
    type?: FeatureFlagType
    setFlagType: (t: FeatureFlagType) => void
    value?: FeatureFlagValue
    setFlagValue: (v: FeatureFlagValue) => void
}> = ({ name, setFlagName, type, setFlagType, value, setFlagValue }) => (
    <>
        <div className="form-group d-flex flex-column">
            <label htmlFor="name">
                <h3>Name</h3>
            </label>
            <input
                id="name"
                type="text"
                className="form-control"
                value={name}
                onChange={({ target: { value } }) => {
                    setFlagName(value)
                }}
            />
            <small className="form-text text-muted">Required.</small>
        </div>

        <Select
            id="type"
            label={<h3>Type</h3>}
            value={type}
            onChange={({ target: { value } }) => setFlagType(value as FeatureFlagType)}
            message="Required."
        >
            <option value="">Select flag type</option>
            <option value="FeatureFlagRollout">Rollout</option>
            <option value="FeatureFlagBoolean">Boolean</option>
        </Select>

        {type && <FeatureFlagValueSettings type={type} value={value} setFlagValue={setFlagValue} />}
    </>
)

/**
 * Displays a modal for configuring the flag value as a certain type. Can be provided an
 * undefined value to instantiate it based on type.
 */
const FeatureFlagValueSettings: React.FunctionComponent<{
    type: FeatureFlagType
    value?: FeatureFlagValue
    setFlagValue: (next: FeatureFlagValue) => void
}> = ({ type, value, setFlagValue }) => {
    if (type === 'FeatureFlagRollout') {
        if (!value || !('rolloutBasisPoints' in value)) {
            value = { rolloutBasisPoints: 0 }
            setFlagValue({ ...value })
        }
        return (
            <FeatureFlagRolloutValueSettings
                value={value}
                update={next => {
                    setFlagValue({
                        ...value,
                        ...next,
                    })
                }}
            />
        )
    }

    if (!value || !('value' in value)) {
        value = { value: false }
        setFlagValue({ ...value })
    }
    return (
        <FeatureFlagBooleanValueSettings
            value={value}
            update={next => {
                setFlagValue({
                    ...value,
                    ...next,
                })
            }}
        />
    )
}

const FeatureFlagRolloutValueSettings: React.FunctionComponent<{
    value: FeatureFlagRolloutValue
    update: (next: FeatureFlagRolloutValue) => void
}> = ({ value, update }) => (
    <div className="form-group d-flex flex-column">
        <label htmlFor="rollout-value">
            <h3>Value</h3>
        </label>
        <input
            type="range"
            id="rollout-value"
            name="rollout-value"
            step="10"
            min="0"
            max="10000"
            className="w-25"
            value={value.rolloutBasisPoints}
            onChange={({ target }) => {
                update({ rolloutBasisPoints: parseInt(target.value, 10) })
            }}
            aria-describedby="feature-flag-rollout-description"
        />
        <div className="flex-column mt-3" id="feature-flag-rollout-description">
            <div>{value.rolloutBasisPoints} basis points</div>
            <div className="text-muted">
                This feature is enabled for {Math.floor(value.rolloutBasisPoints / 100) || 0}% of users.
            </div>
        </div>
    </div>
)

const FeatureFlagBooleanValueSettings: React.FunctionComponent<{
    value: FeatureFlagBooleanValue
    update: (next: FeatureFlagBooleanValue) => void
}> = ({ value, update }) => (
    <div className="form-group d-flex flex-column">
        <label htmlFor="bool-value">
            <h3>Value</h3>
        </label>
        <div className="d-flex">
            <div>
                <Toggle
                    title="Value"
                    value={value.value}
                    onToggle={isTrue => {
                        update({ value: isTrue })
                    }}
                    className="mr-2"
                    aria-describedby="feature-flag-toggle-description"
                />{' '}
            </div>
            <div className="flex-column" id="feature-flag-toggle-description">
                <div>{value.value ? 'True' : 'False'}</div>
                <div className="text-muted">
                    {value.value ? 'This feature is enabled.' : 'This feature is disabled.'}
                </div>
            </div>
        </div>
    </div>
)

/**
 * Searches for potential references and renders them in a collapsible, or returns an
 * empty fragment - this allows references to works seamlessly in case the flag has not
 * been implemented yet, or if this Sourcegraph instance does not have a copy of the
 * Sourcegraph repository.
 */
const ReferencesCollapsible: React.FunctionComponent<{
    flagName: string | undefined
    productGitVersion: string
}> = ({ flagName, productGitVersion }) => {
    const references = useObservable(
        useMemo(() => (flagName ? getFeatureFlagReferences(flagName, productGitVersion) : of([])), [
            flagName,
            productGitVersion,
        ])
    )
    if (references === undefined || references.length === 0) {
        return <></>
    }
    return (
        <Collapsible
            title={<h3>References</h3>}
            detail={`${references.length} potential feature flag ${pluralize(
                'reference',
                references.length
            )} in sourcegraph@${productGitVersion}`}
            className="p-0 font-weight-normal mt-3"
            buttonClassName="mb-0"
            titleAtStart={true}
            defaultExpanded={false}
        >
            <div className="pt-2">
                {references.map(reference => (
                    <div key={(flagName || '') + reference.file}>
                        <Link target="_blank" rel="noopener noreferrer" to={reference.searchURL}>
                            <code>{reference.file}</code>
                        </Link>
                    </div>
                ))}
            </div>
        </Collapsible>
    )
}

const CREATE_FEATURE_FLAG_MUTATION = gql`
    mutation create($name: String!, $value: Boolean, $rolloutBasisPoints: Int) {
        createFeatureFlag(name: $name, value: $value, rolloutBasisPoints: $rolloutBasisPoints) {
            __typename
        }
    }
`

const UPDATE_FEATURE_FLAG_MUTATION = gql`
    mutation update($name: String!, $value: Boolean, $rolloutBasisPoints: Int) {
        updateFeatureFlag(name: $name, value: $value, rolloutBasisPoints: $rolloutBasisPoints) {
            __typename
        }
    }
`

const DELETE_FEATURE_FLAG_MUTATION = gql`
    mutation delete($name: String!) {
        deleteFeatureFlag(name: $name) {
            alwaysNil
        }
    }
`

const CREATE_FEATURE_FLAG_OVERRIDE_MUTATION = gql`
    mutation createFeatureFlagOverride($namespace: ID!, $flagName: String!, $value: Boolean!) {
        createFeatureFlagOverride(namespace: $namespace, flagName: $flagName, value: $value) {
            id
            value
        }
    }
`

const UPDATE_FEATURE_FLAG_OVERRIDE_MUTATION = gql`
    mutation updateFeatureFlagOverride($id: ID!, $value: Boolean!) {
        updateFeatureFlagOverride(id: $id, value: $value) {
            id
            value
        }
    }
`

const DELETE_FEATURE_FLAG_OVERRIDE_MUTATION = gql`
    mutation deleteFeatureFlagOverride($id: ID!) {
        deleteFeatureFlagOverride(id: $id) {
            alwaysNil
        }
    }
`
