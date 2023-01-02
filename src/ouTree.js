import React from 'react'
import PropTypes from 'prop-types'
import i18n from '@dhis2/d2-i18n'
import { hasValue, composeValidators } from '@dhis2/ui'
import { OrgUnitTreeField } from './orgUnitTree/OrgUnitTreeField';
import {
    SINGLE_ORG_VALIDATOR,
    SINGLE_EXACT_ORG_VALIDATOR,
} from './orgUnitTree/OrgUnitTreeField';

const NAME = 'selectedOrgUnits'
const LABEL = i18n.t('Select OrgUnit')
const DATATEST = 'input-org-unit-tree'

const OrgUnitTree = ({ multiSelect = false, getSelected }) => {
    const orgValidator = multiSelect
        ? SINGLE_ORG_VALIDATOR
        : SINGLE_EXACT_ORG_VALIDATOR
    const validator = composeValidators(hasValue, orgValidator)
    
    return (
        <OrgUnitTreeField
            name={NAME}
            validator={validator}
            multiSelect={multiSelect}
            label={LABEL}
            dataTest={DATATEST}
            getSelected = { getSelected }
        />
    )
}

OrgUnitTree.propTypes = {
    multiSelect: PropTypes.bool,
}

export { OrgUnitTree }