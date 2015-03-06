<?php
/**
 * Created by PhpStorm.
 * User: root
 * Date: 05.03.15
 * Time: 11:23
 */
class ProjectController extends ProjectAuthMappedController
{
    use ResponseView;

    public function getProjectListAction(HttpRequest $request)
    {

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
            'getProjectList' => 'getProjectListAction'
        );
    }
}