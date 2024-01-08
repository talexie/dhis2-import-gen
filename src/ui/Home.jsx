import { Container, Box, Stack } from "@mui/material"

export const Home = ()=>{
    return(
        <Container>
            <Stack>
                <Box>
                    This is a multi-project DHIS2 app used to import, export and map metadata for projects.
                    The app generates DATIM CSV Import if the system indicators are properly mapped to MER Indicators.
                    Reporting Rates and Analytics Data CSV uploads are supported.

                    SMARTCare data Excel files can natively be uploaded. Prior to upload, SMARTCare Indicators 
                    should be mapped to DHIS2.
                </Box>
                <Box>
                    Visit <a href="../../../">Dashboard</a>
                </Box>
            </Stack>
        </Container>
    )
}