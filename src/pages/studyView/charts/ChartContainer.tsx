import * as React from "react";
import styles from "./styles.module.scss";
import {observer} from "mobx-react";
import {action, computed, observable} from "mobx";
import _ from "lodash";
import {StudyViewComponentLoader} from "./StudyViewComponentLoader";
import {ChartControls, ChartHeader} from "pages/studyView/chartHeader/ChartHeader";
import {ChartMeta, ChartType} from "pages/studyView/StudyViewPageStore";
import fileDownload from 'react-file-download';
import PieChart from "pages/studyView/charts/pieChart/PieChart";
import svgToPdfDownload from "shared/lib/svgToPdfDownload";
import classnames from 'classnames';
import ClinicalTable from "pages/studyView/table/ClinicalTable";
import {bind} from "bind-decorator";
import MobxPromise from "mobxpromise";
import SurvivalChart from "../../resultsView/survival/SurvivalChart";
import {MutatedGenesTable} from "../table/MutatedGenesTable";
import {CNAGenesTable} from "../table/CNAGenesTable";
import StudyViewScatterPlot from "./scatterPlot/StudyViewScatterPlot";
import {isSelected, mutationCountVsCnaTooltip} from '../StudyViewUtils';

export interface AbstractChart {
    downloadData: () => string;
    toSVGDOMNode: () => Element
}

export interface IChartContainerProps {
    chartMeta: ChartMeta;
    promise: MobxPromise<any>;
    filters: any;
    onUserSelection?: any;
    onResetSelection?: any;
    onDeleteChart: (chartMeta: ChartMeta) => void;
    selectedGenes?:any;
    onGeneSelect?:any;
    selectedSamplesMap?: any;
    selectedSamples?: any;
}

@observer
export class ChartContainer extends React.Component<IChartContainerProps, {}> {

    private handlers: any;
    private plot: AbstractChart;

    @observable mouseInChart: boolean = false;
    @observable placement: 'left' | 'right' = 'right';
    @observable chartType: ChartType

    @computed
    get fileName() {
        return this.props.chartMeta.displayName.replace(/[ \t]/g, '_');
    }

    constructor(props: IChartContainerProps) {
        super(props);

        this.chartType = this.props.chartMeta.chartType;

        this.handlers = {
            ref: (plot: AbstractChart) => {
                this.plot = plot;
            },
            resetFilters: action(() => {
                this.props.onResetSelection(this.props.chartMeta, []);
            }),
            onUserSelection: action((values: string[]) => {
                this.props.onUserSelection(this.props.chartMeta, values);
            }),
            updateCNAGeneFilter: action((entrezGeneId: number, alteration: number) => {
                this.props.onUserSelection(entrezGeneId, alteration);
            }),
            updateGeneFilter: action((value: number) => {
                this.props.onUserSelection(value);
            }),
            onMouseEnterChart: action((event: React.MouseEvent<any>) => {
                this.placement = event.nativeEvent.x > 800 ? 'left' : 'right';
                this.mouseInChart = true;
            }),
            onMouseLeaveChart: action(() => {
                this.placement = 'right'
                this.mouseInChart = false;
            }),
            handleDownloadDataClick: () => {
                let firstLine = this.props.chartMeta.displayName + '\tCount'
                fileDownload(firstLine + '\n' + this.plot.downloadData(), this.fileName);

            },
            handleSVGClick: () => {
                fileDownload((new XMLSerializer()).serializeToString(this.toSVGDOMNode()), `${this.fileName}.svg`);
            },
            handlePDFClick: () => {
                svgToPdfDownload(`${this.fileName}.pdf`, this.toSVGDOMNode());
            },
            onDeleteChart: () => {
                this.props.onDeleteChart(this.props.chartMeta);
            }
        };
    }

    public toSVGDOMNode(): Element {
        if (this.plot) {
            // Get result of plot
            return this.plot.toSVGDOMNode();
        } else {
            return document.createElementNS("http://www.w3.org/2000/svg", "svg");
        }
    }

    @computed
    get chartWidth() {
        let chartWidth = styles.chartWidthTwo;
        if (this.chartType === ChartType.PIE_CHART) {
            chartWidth = styles.chartWidthOne;
        }
        return chartWidth;
    }

    @computed
    get chartHeight() {
        let chartHeight = styles.chartHeightTwo;
        if (this.chartType === ChartType.PIE_CHART) {
            chartHeight = styles.chartHeightOne;
        }
        return chartHeight;
    }

    @computed
    get hideLabel() {
        return this.chartType === ChartType.TABLE;
    }

    @computed
    get chartControls(): ChartControls {
        let controls = {};
        switch (this.chartType) {
            case ChartType.PIE_CHART: {
                controls = {showTableIcon: true}
                break;
            }
            case ChartType.TABLE: {
                if (!_.isEqual(this.props.chartMeta.chartType, ChartType.TABLE)) {
                    controls = {showPieIcon: true}
                }
                break;
            }
        }
        return {...controls, showResetIcon: this.props.filters && this.props.filters.length > 0};
    }

    @bind
    @action
    changeChartType(chartType: ChartType) {
        this.chartType = chartType;
    }

    @computed
    get chart() {
        switch (this.chartType) {
            case ChartType.PIE_CHART: {
                return (<PieChart
                    ref={this.handlers.ref}
                    onUserSelection={this.handlers.onUserSelection}
                    filters={this.props.filters}
                    data={this.props.promise.result}
                    active={this.mouseInChart}
                    placement={this.placement}
                />)
            }
            case ChartType.TABLE: {
                return (<ClinicalTable
                    data={this.props.promise.result}
                    filters={this.props.filters}
                    onUserSelection={this.handlers.onUserSelection}
                    label={this.props.chartMeta.displayName}
                />)
            }
            case ChartType.MUTATED_GENES_TABLE: {
                return (
                    <MutatedGenesTable
                        promise={this.props.promise}
                        numOfSelectedSamples={100}
                        filters={this.props.filters}
                        onUserSelection={this.handlers.updateGeneFilter}
                        onGeneSelect={this.props.onGeneSelect}
                        selectedGenes={this.props.selectedGenes}
                    />
                );
            }
            case ChartType.CNA_GENES_TABLE: {
                return (
                    <CNAGenesTable
                        promise={this.props.promise}
                        numOfSelectedSamples={100}
                        filters={this.props.filters}
                        onUserSelection={this.handlers.updateCNAGeneFilter}
                        onGeneSelect={this.props.onGeneSelect}
                        selectedGenes={this.props.selectedGenes}
                    />
                );
            }
            case ChartType.SURVIVAL: {
                return (
                    <SurvivalChart alteredPatientSurvivals={this.props.promise.result.alteredGroup}
                                   unalteredPatientSurvivals={this.props.promise.result.unalteredGroup}
                                   title={'test'}
                                   xAxisLabel="Months Survival"
                                   yAxisLabel="Surviving"
                                   totalCasesHeader="Number of Cases, Total"
                                   statusCasesHeader="Number of Cases, Deceased"
                                   medianMonthsHeader="Median Months Survival"
                                   yLabelTooltip="Survival estimate"
                                   xLabelWithEventTooltip="Time of death"
                                   xLabelWithoutEventTooltip="Time of last observation"
                                   showDownloadButtons={false}
                                   showTable={false}
                                   showLegend={false}
                                   styleOpts={{
                                       width: 400,
                                       height: 380
                                   }}
                                   fileName="Overall_Survival"/>
                )
            }
            case ChartType.SCATTER: {
                return (
                    <StudyViewScatterPlot
                        width={400}
                        height={380}
                        onSelection={this.props.onUserSelection}
                        data={this.props.promise.result}
                        isSelected={d => isSelected(d, this.props.selectedSamplesMap)}
                        isLoading={this.props.selectedSamples.isPending}
                        selectedFill="#ff0000"
                        unselectedFill="#0000ff"
                        axisLabelX="Fraction of copy number altered genome"
                        axisLabelY="# of mutations"
                        tooltip={mutationCountVsCnaTooltip}
                    />
                )
            }
            default:
                return null;
        }
    }

    public render() {
        return (
            <div className={classnames(styles.chart, this.chartWidth, this.chartHeight)}
                 onMouseEnter={this.handlers.onMouseEnterChart}
                 onMouseLeave={this.handlers.onMouseLeaveChart}>
                <ChartHeader
                    chartMeta={this.props.chartMeta}
                    active={this.mouseInChart}
                    resetChart={this.handlers.resetFilters}
                    deleteChart={this.handlers.onDeleteChart}
                    hideLabel={this.hideLabel}
                    chartControls={this.chartControls}
                    changeChartType={this.changeChartType}
                />
                <StudyViewComponentLoader promise={this.props.promise}>
                    {this.chart}
                </StudyViewComponentLoader>
            </div>
        );
    }
}
