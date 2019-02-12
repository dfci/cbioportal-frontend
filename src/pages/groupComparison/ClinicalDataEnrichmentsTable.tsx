import * as React from 'react';
import * as _ from "lodash";
import { observer } from "mobx-react";
import autobind from 'autobind-decorator';
import LazyMobXTable from 'shared/components/lazyMobXTable/LazyMobXTable';
import { toConditionalPrecision } from 'shared/lib/NumberUtils';
import { ClinicalDataEnrichmentStore } from './ClinicalData';
import { ClinicalDataEnrichmentWithQ } from './GroupComparisonUtils';

export interface IClinicalDataEnrichmentsTableProps {
    dataStore: ClinicalDataEnrichmentStore;
}

export enum ClinicalDataEnrichmentTableColumnType {
    CLINICAL_ATTRIBUTE_NAME = "Clinical Attribute",
    CLINICAL_ATTRIBUTE_TYPE = "Attribute Type",
    STATISTICAL_TEST_NAME = "Statistical Test",
    SCORE = "Score",
    P_VALUE = "p-Value",
    Q_VALUE = "q-Value"
}

const COLUMNS = [
    {
        name: ClinicalDataEnrichmentTableColumnType.CLINICAL_ATTRIBUTE_NAME,
        render: (d: ClinicalDataEnrichmentWithQ) => <span style={{}}>{d.clinicalAttribute.displayName}</span>,
        filter: (d: ClinicalDataEnrichmentWithQ, f: string, filterStringUpper: string) => (d.clinicalAttribute.displayName.toUpperCase().indexOf(filterStringUpper) > -1),
        sortBy: (d: ClinicalDataEnrichmentWithQ) => d.clinicalAttribute.displayName,
        download: (d: ClinicalDataEnrichmentWithQ) => d.clinicalAttribute.displayName,
        width: 160
    },
    {
        name: ClinicalDataEnrichmentTableColumnType.CLINICAL_ATTRIBUTE_TYPE,
        render: (d: ClinicalDataEnrichmentWithQ) => <span>{d.clinicalAttribute.patientAttribute ? "Patient" : "Sample"}</span>,
        filter: (d: ClinicalDataEnrichmentWithQ, f: string, filterStringUpper: string) => ((d.clinicalAttribute.patientAttribute ? "Patient" : "Sample").toUpperCase().indexOf(filterStringUpper) > -1),
        sortBy: (d: ClinicalDataEnrichmentWithQ) => d.clinicalAttribute.patientAttribute ? "Patient" : "Sample",
        download: (d: ClinicalDataEnrichmentWithQ) => d.clinicalAttribute.patientAttribute ? "Patient" : "Sample",
        width: 100
    },
    {
        name: ClinicalDataEnrichmentTableColumnType.STATISTICAL_TEST_NAME,
        render: (d: ClinicalDataEnrichmentWithQ) => <span style={{ whiteSpace: "nowrap" }}>{d.method}</span>,
        filter: (d: ClinicalDataEnrichmentWithQ, f: string, filterStringUpper: string) => (d.method.toUpperCase().indexOf(filterStringUpper) > -1),
        sortBy: (d: ClinicalDataEnrichmentWithQ) => d.method,
        download: (d: ClinicalDataEnrichmentWithQ) => d.method,
        width: 130
    },
    {
        name: ClinicalDataEnrichmentTableColumnType.SCORE,
        render: (d: ClinicalDataEnrichmentWithQ) => <span style={{ whiteSpace: 'nowrap' }}>{toConditionalPrecision(d.score, 3, 0.01)}</span>,
        sortBy: (d: ClinicalDataEnrichmentWithQ) => d.score,
        download: (d: ClinicalDataEnrichmentWithQ) => toConditionalPrecision(d.score, 3, 0.01),
        width: 100
    },
    {
        name: ClinicalDataEnrichmentTableColumnType.P_VALUE,
        render: (d: ClinicalDataEnrichmentWithQ) => <span style={{ whiteSpace: 'nowrap' }}>{toConditionalPrecision(d.pValue, 3, 0.01)}</span>,
        sortBy: (d: ClinicalDataEnrichmentWithQ) => d.pValue,
        download: (d: ClinicalDataEnrichmentWithQ) => toConditionalPrecision(d.pValue, 3, 0.01),
        width: 100
    },
    {
        name: ClinicalDataEnrichmentTableColumnType.Q_VALUE,
        render: (d: ClinicalDataEnrichmentWithQ) => <span style={{ whiteSpace: 'nowrap' }}>{toConditionalPrecision(d.qValue, 3, 0.01)}</span>,
        sortBy: (d: ClinicalDataEnrichmentWithQ) => d.qValue,
        download: (d: ClinicalDataEnrichmentWithQ) => toConditionalPrecision(d.qValue, 3, 0.01),
        width: 100
    }
];

@observer
export default class ClinicalDataEnrichmentsTable extends React.Component<IClinicalDataEnrichmentsTableProps, {}> {

    @autobind
    private onRowClick(d: ClinicalDataEnrichmentWithQ) {
        this.props.dataStore.setHighlighted(d);
    }

    public render() {
        return (
            <LazyMobXTable
                columns={COLUMNS}
                initialSortColumn={ClinicalDataEnrichmentTableColumnType.Q_VALUE}
                initialSortDirection="asc"
                showColumnVisibility={false}
                dataStore={this.props.dataStore}
                onRowClick={this.onRowClick}
                paginationProps={{ itemsPerPageOptions: [20] }}
                initialItemsPerPage={25}
                copyDownloadProps={{
                    showCopy: false
                }}
            />
        );
    }
}
