import Welcome from '../components/Welcome';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/router';



function Index() {

  const user = useSelector((state) => state.user.value);
  const router = useRouter()

  if (!user.token) {
    return <Welcome />;

  } else {
    router.push({
      pathname: '/Accueil',

    });
  }


}

export default Index;
