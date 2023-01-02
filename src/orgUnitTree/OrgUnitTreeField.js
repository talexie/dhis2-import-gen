import React from 'react'
import PropTypes from 'prop-types'
import i18n from '@dhis2/d2-i18n'

import { OrgUnitTree2 } from './OrgUnitTree'

const SINGLE_ORG_VALIDATOR = selectedOrgUnits =>
    selectedOrgUnits.length === 0
        ? i18n.t('At least one organisation unit must be selected')
        : undefined

const SINGLE_EXACT_ORG_VALIDATOR = selectedOrgUnits =>
    selectedOrgUnits.length !== 1
        ? i18n.t('One organisation unit must be selected')
        : undefined

const OrgUnitTreeField = (props) => {
    const { meta,name, validator,getSelected, ...rest } = props;
    return (
        <OrgUnitTree2
            name = { name }
            meta={meta }
            getSelected = { getSelected }
            {...props}
            {...rest}
        />
    )
}

OrgUnitTreeField.propTypes = {
    name: PropTypes.string.isRequired,
    validator: PropTypes.func,
}

export { OrgUnitTreeField, SINGLE_ORG_VALIDATOR, SINGLE_EXACT_ORG_VALIDATOR }