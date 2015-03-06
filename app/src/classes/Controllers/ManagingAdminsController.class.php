<?php
/**
 * Created by PhpStorm.
 * User: root
 * Date: 04.03.15
 * Time: 14:35
 */
class ManagingAdminsController extends ProjectAuthMappedController{

    use ResponseView;

    public function addAction(HttpRequest $request)
    {
        return ModelAndView::create()
            ->setModel(Model::create())
            ->setView('administration/profile-admin');
    }
    /**
     * Мапинг методов конроллера
     * Можно вернуть пустой массив если брать с учетом
     * что экшен будет тот который прописан в роут конфиге
     *
     * @return array
     */
    protected function /* array */
    getMapping()
    {
        return array(
            'add' => 'addAction'
        );
        // TODO: Implement getMapping() method.
    }
}