import * as React from 'react';
import {PageLayout} from "../../../shared/components/PageLayout/PageLayout";
import AppConfig from "appConfig";
import StaticContent from "../../../shared/components/staticContent/StaticContent";
import './styles.scss';
import Helmet from "react-helmet";

export default class downloadProfileData extends React.Component<{}, {}> {

    public render() {
        return <PageLayout className={'whiteBackground staticPage'}>
            <Helmet>
                <title>{'Download Profile Data'}</title>
            </Helmet>
            <div dangerouslySetInnerHTML={{__html: "\n" +
                    "<p style = \"font-size: 24px !important; font-family: 'Roboto', sans-serif; line-height: 28px;  font-weight: 100;\"> Registered users can now download all de-identified Profile Data. Please review the terms of access below. Note that these terms are identical to the terms of access you agreed to upon registration.</p><br>\n" +
                    "<p style=\"font-family: 'Roboto', sans-serif; font-weight: 900; line-height: 22px; font-size: 18px !important;\">I agree not to redistribute cBioPortal data, either internally or externally.<span style=\"color: red; display: inline;\">*</span></p>\n" +
                    "<p style=\"font-family: 'Roboto', sans-serif; font-weight: 100; color: grey; line-height: 22px; font-size: 18px !important;\">For example, you agree not to download data from the portal and make it available on a DFCI web server, or email the data file to a colleague outside of DFCI, BWH or BCH.</p>\n" +
                    "<input type=\"radio\" name=\"first\" value=\"agree\" style=\"margin-left: 5px;\"> <label style=\"font-size: 14px;\">Agree</label><br>\n" +
                    "<input type=\"radio\" name=\"first\" value=\"disagree\" style=\"margin-left: 5px;\"> <label style=\"font-size: 14px;\">Disagree</label><br><br>\n" +
                    "<p style=\"font-family: 'Roboto', sans-serif; font-weight: 900; line-height: 22px; font-size: 18px !important;\">I agree not to use any data within the portal to re-identify a patient.<span style=\"color: red; display: inline;\">*</span></p>\n" +
                    "<p style=\"font-family: 'Roboto', sans-serif; font-weight: 100; color: grey; line-height: 22px; font-size: 18px !important;\">For example, you agree not to use some combination of genomic data plus de-identified clinical data to re-identify a patient.</p>\n" +
                    "<input type=\"radio\" name=\"second\" value=\"agree\" style=\"margin-left: 5px;\"> <label style=\"font-size: 14px;\">Agree</label><br>\n" +
                    "<input type=\"radio\" name=\"second\" value=\"disagree\" style=\"margin-left: 5px;\"> <label style=\"font-size: 14px;\">Disagree</label><br><br>\n" +
                    "<p style=\"font-family: 'Roboto', sans-serif; font-weight: 900; line-height: 22px; line-height: 22px; font-size: 18px !important;\">I agree to contact and receive approval from the appropriate Data Use Committee through OncDRS prior to publishing any results derived from cBioPortal or Profile.<span style=\"color: red;  display: inline;\">*</span></p>\n" +
                    "<p style=\"font-family: 'Roboto', sans-serif; font-weight: 100; color: grey; line-height: 22px; font-size: 18px !important;\">This is required by the Profile Project, DFCI IRB protocol 11-104.</p>\n" +
                    "<input type=\"radio\" name=\"third\" value=\"agree\" style=\"margin-left: 5px;\"> <label style=\"font-size: 14px;\">Agree</label><br>\n" +
                    "<input type=\"radio\" name=\"third\" value=\"disagree\" style=\"margin-left: 5px;\"> <label style=\"font-size: 14px;\">Disagree</label><br><br>\n" +
                    "<form action=\"profile_latest.tar.gz\">\n" +
                    "    <button type=\"submit\" id=\"button\" style=\"width:150px;height:50px;border-radius: 5px; color: white; border-style: hidden;\">Download</button>\n" +
                    "</form>\n" +
                    "\n" +
                    "<script type=\"text/javascript\">\n" +
                    "\n" +
                    "    $(document).ready(function() {\n" +
                    "\n" +
                    "        var button = $(\"#button\");\n" +
                    "        disableButton(button);\n" +
                    "\n" +
                    "        var checked1 = false;\n" +
                    "        var checked2 = false;\n" +
                    "        var checked3 = false;\n" +
                    "\n" +
                    "        $('input[type=radio][name=first]').change(function() {\n" +
                    "\n" +
                    "            if (this.value == 'agree') {\n" +
                    "                checked1 = true;\n" +
                    "                enableButton(button);\n" +
                    "            } else {\n" +
                    "                checked1 = false;\n" +
                    "                disableButton(button);\n" +
                    "            }\n" +
                    "        });\n" +
                    "\n" +
                    "        $('input[type=radio][name=second]').change(function() {\n" +
                    "\n" +
                    "            if (this.value == 'agree') {\n" +
                    "                checked2 = true;\n" +
                    "                enableButton(button);\n" +
                    "            } else {\n" +
                    "                checked2 = false;\n" +
                    "                disableButton(button);\n" +
                    "            }\n" +
                    "        });\n" +
                    "\n" +
                    "        $('input[type=radio][name=third]').change(function() {\n" +
                    "\n" +
                    "            if (this.value == 'agree') {\n" +
                    "                checked3 = true;\n" +
                    "                enableButton(button);\n" +
                    "            } else {\n" +
                    "                checked3 = false;\n" +
                    "                disableButton(button);\n" +
                    "            }\n" +
                    "        });\n" +
                    "\n" +
                    "        function disableButton(button) {\n" +
                    "\n" +
                    "            button.prop(\"disabled\", true);\n" +
                    "            button.css('background-color', 'grey');\n" +
                    "            button.css('border-color', 'grey');\n" +
                    "        }\n" +
                    "\n" +
                    "        function enableButton(button) {\n" +
                    "            if (checked1 && checked2 && checked3) {\n" +
                    "                button.prop(\"disabled\", false);\n" +
                    "                button.css('background-color', '#228B22');\n" +
                    "                button.css('border-color', '#228B22');\n" +
                    "            }\n" +
                    "        }\n" +
                    "    });\n" +
                    "\n" +
                    "</script>"}} />
        </PageLayout>
    }

}




