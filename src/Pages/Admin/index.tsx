import { Helmet } from "react-helmet-async"
import Admin from "../../Layout/Admin"

const Index = () => {
    return (
        <Admin>
            <Helmet>
                <title>Ranguinho - Dashboard</title>
            </Helmet>
        </Admin>
    )
}

export default Index